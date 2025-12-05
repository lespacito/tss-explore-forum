import { MenuIcon, Search, User, Settings, LogOut } from 'lucide-react'
import { useState } from 'react'
import { Link, useRouter, useRouterState, getRouteApi } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import Logo from '@/components/shadcn-studio/logo'
import { signOut } from '@/features/auth/lib/auth-client'

type NavigationItem = {
  title: string
  href: string
}[]

const usefulLinks = [
  { title: 'Règles', href: '/rules' },
  { title: 'FAQ', href: '/faq' },
  { title: 'Conseils de Sécurité', href: '/safety' },
  { title: 'Contact', href: '/contact' },
]

const routeApi = getRouteApi('__root__')

const Navbar = ({ navigationData }: { navigationData: NavigationItem }) => {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const { authSession } = routeApi.useLoaderData()
  const user = authSession?.user
  const [imageLoaded, setImageLoaded] = useState(false)
  const routerState = useRouterState()
  const isPending = routerState.isLoading

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!searchQuery.trim()) return
    router.navigate({
      to: '/search',
      search: { q: searchQuery.trim() },
    })
  }

  async function handleSignOut() {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.invalidate()
          router.navigate({ to: '/' })
        },
      },
    })
  }

  const getUserInitials = () => {
    if (!user?.displayUsername) return 'U'
    return user.displayUsername
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className='bg-background sticky top-0 z-50 border-b'>
      <div className='mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-7 sm:px-6'>
        <div className='flex items-center gap-4'>
          <SidebarTrigger />
          <div className='text-muted-foreground flex flex-1 items-center gap-8 font-medium md:justify-center lg:gap-16'>
            <Link to='/' >
              <Logo />
            </Link>
            {usefulLinks.map((item) => (
              <Link
                key={item.title}
                to={item.href}
                className='hover:text-primary max-md:hidden whitespace-nowrap'
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>

        <div className='flex items-center gap-4'>
          <form
            onSubmit={handleSearch}
            className='hidden md:flex items-center relative'
          >
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              type='search'
              placeholder='Recherche...'
              className='pl-9 pr-4 w-64'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {/* Mobile menu dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className='md:hidden' asChild>
              <Button variant='outline' size='icon'>
                <MenuIcon />
                <span className='sr-only'>Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-56' align='end'>
              <DropdownMenuGroup>
                {usefulLinks.map((item) => (
                  <DropdownMenuItem key={item.title} asChild>
                    <Link to={item.href}>{item.title}</Link>
                  </DropdownMenuItem>
                ))}
                {navigationData.map((item, index) => (
                  <DropdownMenuItem key={index} asChild>
                    <Link to={item.href}>{item.title}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User profile dropdown */}
          {isPending ? (
            <div className='flex items-center gap-2'>
              <div className='h-10 w-10 rounded-full bg-muted animate-pulse' />
              <div className='hidden sm:block h-4 w-24 bg-muted animate-pulse rounded' />
            </div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  className='relative h-10 gap-2 rounded-full pl-2 pr-3 hover:bg-accent'
                >
                  <Avatar className='h-8 w-8'>
                    {user.image && (
                      <>
                        {!imageLoaded && (
                          <div className='h-full w-full bg-muted animate-pulse rounded-full' />
                        )}
                        <AvatarImage
                          src={user.image}
                          alt={user.displayUsername || user.username || ""}
                          onLoad={() => setImageLoaded(true)}
                          className={imageLoaded ? 'opacity-100' : 'opacity-0'}
                        />
                      </>
                    )}
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <span className='hidden sm:inline text-sm font-medium'>
                    {user.displayUsername}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-56'>
                <DropdownMenuLabel>
                  <div className='flex flex-col space-y-1'>
                    <p className='text-sm font-medium leading-none'>
                      {user.displayUsername}
                    </p>
                    {user.username && (
                      <p className='text-xs leading-none text-muted-foreground'>
                        @{user.username}
                      </p>
                    )}
                    <p className='text-xs leading-none text-muted-foreground'>
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to='/account/profile' className='cursor-pointer'>
                    <User className='mr-2 h-4 w-4' />
                    <span>Profil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to='/account/settings' className='cursor-pointer'>
                    <Settings className='mr-2 h-4 w-4' />
                    <span>Paramètres</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className='cursor-pointer text-red-600 focus:text-red-600'
                >
                  <LogOut className='mr-2 h-4 w-4' />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className='flex items-center gap-2'>
              <Button asChild variant='ghost' size='sm'>
                <Link to='/auth/login'>Se connecter</Link>
              </Button>
              <Button asChild size='sm' className='hidden sm:inline-flex'>
                <Link to='/auth/login'>Commencer</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
