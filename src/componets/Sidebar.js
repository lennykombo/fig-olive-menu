import { useState } from "react";
import { Menu, X } from "lucide-react";

const Sidebar = () => {

     const [isOpen, setIsOpen] = useState(false);

  return (
     <>
      {/* Burger Button (only visible on small screens) */}
      <button
        className="lg:hidden p-3 fixed top-4 left-4 z-50 text-white rounded"
        style={{ backgroundColor: "#3D441E" }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
          className={`h-screen w-64 text-white p-6 transform
  ${isOpen ? "fixed top-0 left-0 translate-x-0" : "fixed top-0 left-0 -translate-x-full"}
  transition-transform duration-300 lg:translate-x-0 lg:static lg:block z-10`}
  style={{ backgroundColor: "#3D441E" }}
      >
        <h2 className="text-2xl font-bold mb-6 mt-12">Admin Panel</h2>
        <nav>
          <ul>
            <li className="mb-3"><a href="/admin">Categories</a></li>
            <li><a href="/dashmenu">Menu Items</a></li>
          </ul>
        </nav>
      </aside>
    </>
  )
}

export default Sidebar