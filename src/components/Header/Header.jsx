import React, { useState } from 'react'
import { Container, Logo, LogoutBtn } from '../index'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

function Header() {
  const authStatus = useSelector((state) => state.auth.status)
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      navigate(`/all-posts?search=${encodeURIComponent(searchTerm.trim())}`)
    }
  }

  const navItems = [
    { name: 'Home', slug: '/', active: true },
    { name: 'Login', slug: '/login', active: !authStatus },
    { name: 'Signup', slug: '/signup', active: !authStatus },
    { name: 'All Posts', slug: '/all-posts', active: authStatus },
    { name: 'Add Post', slug: '/add-post', active: authStatus },
  ]

  return (
    <header className='sticky top-0 z-50 bg-gradient-to-r from-[#2563eb] to-[#0ea5e9] shadow-md'>
      <Container>
        <nav className='flex flex-wrap items-center justify-between py-4 gap-y-4'>
          {/* Logo */}
          <Link to='/' className='flex items-center space-x-2'>
            <Logo width='60px' />
          </Link>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="flex items-center bg-white rounded-full overflow-hidden px-3 py-1 shadow-md"
          >
            <input
              type="text"
              placeholder="Search blogs..."
              className="outline-none px-2 py-1 text-sm text-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="text-blue-600 font-semibold text-sm ml-2 hover:underline">
              Search
            </button>
          </form>

          {/* Navigation Buttons */}
          <ul className='flex items-center space-x-4'>
            {navItems.map((item) =>
              item.active ? (
                <li key={item.name}>
                  <button
                    onClick={() => navigate(item.slug)}
                    className='px-4 py-2 text-white font-medium hover:text-[#0ea5e9] hover:bg-white bg-opacity-10 backdrop-blur-md rounded-full transition-all duration-200'
                  >
                    {item.name}
                  </button>
                </li>
              ) : null
            )}
            {authStatus && (
              <li>
                <LogoutBtn />
              </li>
            )}
          </ul>
        </nav>
      </Container>
    </header>
  )
}

export default Header
