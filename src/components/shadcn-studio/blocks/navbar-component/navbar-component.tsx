import { MenuIcon, Search } from 'lucide-react'
import { useState } from 'react'
import { Link, useRouter } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

import Logo from '@/components/shadcn-studio/logo'

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

const Navbar = ({ navigationData }: { navigationData: NavigationItem }) => {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!searchQuery.trim()) return
    router.navigate({
      to: '/search',
      search: { q: searchQuery.trim() },
    })
  }

  return (
    <header className='bg-background sticky top-0 z-50'>
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
                className='hover:text-primary max-md:hidden'
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>

        <div className='flex items-center gap-6'>
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
                  <DropdownMenuItem key={item.title}>
                    <Link to={item.href}>{item.title}</Link>
                  </DropdownMenuItem>
                ))}
                {navigationData.map((item, index) => (
                  <DropdownMenuItem key={index}>
                    <Link to={item.href}>{item.title}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

export default Navbar
