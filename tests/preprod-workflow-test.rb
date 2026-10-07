# Run: ruby tests/preprod-workflow-test.rb (standard library; no registry access).
require 'yaml'
require 'minitest/autorun'
require 'tmpdir'
require 'fileutils'
require 'open3'

class PreprodWorkflowTest < Minitest::Test
  WORKFLOW = YAML.load_file(File.expand_path('../.github/workflows/preprod-ghcr.yml', __dir__))
  STEPS = WORKFLOW.fetch('jobs').fetch('publish').fetch('steps')

  def step(name)
    STEPS.find { |s| s['name'] == name }.fetch('run')
  end

  def test_manual_only_minimal_permissions_and_fixed_sha
    assert_equal ['workflow_dispatch'], (WORKFLOW['on'] || WORKFLOW[true]).keys
    assert_equal({'contents' => 'read', 'packages' => 'write'}, WORKFLOW['permissions'])
    assert_equal 'cd99f328c0e5ab9287651fb38d4f36d91414328f', WORKFLOW['env']['SOURCE_SHA']
    checkout = STEPS.find { |s| s['uses'].to_s.start_with?('actions/checkout@') }
    assert_equal '${{ env.SOURCE_SHA }}', checkout['with']['ref']
    assert_equal false, checkout['with']['persist-credentials']
    assert_includes step('Verify source SHA and Dockerfile contract'), 'git -C source rev-parse HEAD'
    assert_includes WORKFLOW['jobs']['publish']['if'], "github.ref == 'refs/heads/master'"
    assert_equal false, WORKFLOW['concurrency']['cancel-in-progress']
  end

  def test_build_and_validation_precede_every_push
    names = STEPS.map { |s| s['name'] }
    assert_operator names.index('Verify migration payload offline without executing it'), :<,
      names.index('Publish and verify exact registry digests')
    assert_operator names.index('Recheck all tags immediately before publication'), :<,
      names.index('Publish and verify exact registry digests')
    build = step('Build both targets without publishing')
    assert_includes build, '--platform linux/amd64 --load'
    assert_includes build, '--target builder'
    assert_includes build, '--target runner'
    assert_includes build, 'oven/bun:1-alpine=docker-image://$BASE_REF'
    refute_includes build, '--push'
    payload = step('Verify migration payload offline without executing it')
    assert_includes payload, '--network none --read-only'
    refute_match(/db:migrate|drizzle-kit migrate|db:push/, payload)
    text = File.read(File.expand_path('../.github/workflows/preprod-ghcr.yml', __dir__), encoding: 'UTF-8')
    assert_equal ['GITHUB_TOKEN'], text.scan(/secrets\.([A-Z_]+)/).flatten.uniq
    refute_match(/:latest\b|:dev\b|workflow_run:|repository_dispatch:|\bssh\b|dokploy/i, text)
  end

  def test_shell_syntax_for_all_run_steps
    STEPS.each do |s|
      next unless s['run']
      _out, err, status = Open3.capture3('bash', '-n', stdin_data: s['run'])
      assert status.success?, "#{s['name']}: #{err}"
    end
  end

  def guard_result(status_code, fail_network = false)
    script = step('Prepare strict registry collision guard').split("<<'GUARD'\n", 2)[1].split("\nGUARD", 2)[0]
    Dir.mktmpdir('pv-guard-') do |dir|
      File.write("#{dir}/curl", <<~'SH')
        #!/bin/bash
        if [[ "$*" == *'/token?'* ]]; then
          echo '{"token":"fixture-only"}'
        else
          [[ "$MOCK_FAIL" == 0 ]] || exit 7
          echo "$*" >> "$MOCK_LOG"
          printf '%s' "$MOCK_STATUS"
        fi
      SH
      # Only the guard token extraction needs jq in these offline tests.
      File.write("#{dir}/jq", "#!/bin/bash\ncat >/dev/null\necho fixture-only\n")
      FileUtils.chmod(0755, ["#{dir}/curl", "#{dir}/jq"])
      env = {'PATH' => "#{dir}:#{ENV['PATH']}", 'MOCK_STATUS' => status_code,
        'MOCK_FAIL' => fail_network ? '1' : '0', 'MOCK_LOG' => "#{dir}/calls",
        'APP_IMAGE' => 'ghcr.io/lespacito/app', 'MIGRATE_IMAGE' => 'ghcr.io/lespacito/migrate',
        'SHA_TAG' => 'sha-fixture', 'RUN_TAG' => 'sha-fixture-run-1-attempt-1',
        'GITHUB_ACTOR' => 'fixture', 'GHCR_TOKEN' => 'fixture-only'}
      out, err, result = Open3.capture3(env, 'bash', stdin_data: script)
      calls = File.exist?("#{dir}/calls") ? File.readlines("#{dir}/calls") : []
      return result.success?, out + err, calls
    end
  end

  def test_guard_allows_only_confirmed_absence_for_both_tags_and_images
    success, _output, calls = guard_result('404')
    assert success
    assert_equal 4, calls.length
    assert calls.any? { |c| c.include?('/lespacito/migrate/manifests/sha-fixture-run-1-attempt-1') }
  end

  def test_guard_refuses_existing_tags
    success, output, calls = guard_result('200')
    refute success
    assert_includes output, 'Refusing to overwrite'
    assert_equal 1, calls.length
  end

  def test_guard_fails_closed_on_auth_server_and_network_errors
    %w[401 403 429 500].each do |code|
      success, output, _calls = guard_result(code)
      refute success
      assert_includes output, "HTTP #{code}"
    end
    refute guard_result('404', true)[0]
  end

  def test_offline_payload_checks_every_journal_entry_and_executable
    body = step('Verify migration payload offline without executing it').split(" -e '\n", 2)[1].sub(/'\s*\z/, '')
    Dir.mktmpdir('pv-payload-') do |dir|
      FileUtils.mkdir_p(["#{dir}/drizzle/meta", "#{dir}/node_modules/drizzle-kit", "#{dir}/node_modules/.bin"])
      File.write("#{dir}/drizzle.config.ts", 'fixture config, never imported')
      File.write("#{dir}/drizzle/meta/_journal.json", '{"entries":[{"tag":"0000_fixture"}]}')
      File.write("#{dir}/drizzle/0000_fixture.sql", 'SELECT 1;')
      File.write("#{dir}/node_modules/drizzle-kit/package.json", '{"name":"drizzle-kit","version":"fixture"}')
      File.write("#{dir}/node_modules/.bin/drizzle-kit", '# not executed')
      FileUtils.chmod(0755, "#{dir}/node_modules/.bin/drizzle-kit")
      payload = body.gsub('/app/', "#{dir}/")
      _out, err, ok = Open3.capture3('bun', '-e', payload)
      assert ok.success?, err
      FileUtils.chmod(0644, "#{dir}/node_modules/.bin/drizzle-kit")
      refute Open3.capture3('bun', '-e', payload)[2].success?
      FileUtils.chmod(0755, "#{dir}/node_modules/.bin/drizzle-kit")
      File.rename("#{dir}/drizzle/0000_fixture.sql", "#{dir}/missing.sql")
      refute Open3.capture3('bun', '-e', payload)[2].success?
    end
  end
end
