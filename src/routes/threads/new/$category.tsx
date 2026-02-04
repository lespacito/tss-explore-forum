import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/threads/new/$category")({
  component: NewThreadFormPage,
});

function NewThreadFormPage() {
  return <div>New thread form</div>;
}
