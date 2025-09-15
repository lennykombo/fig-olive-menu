// src/pages/admin/Dashboard.jsx
import { useState, useEffect, useRef } from "react";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import toast, { Toaster } from "react-hot-toast";
import Sidebar from "../componets/Sidebar";
import { HiDotsVertical } from "react-icons/hi";


const Dashboard = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState("");

   const menuRef = useRef();

  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await getDocs(collection(db, "category"));
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchCategories();
  }, []);

  // close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    const docRef = await addDoc(collection(db, "category"), {
      name: newCategory,
    });
    setCategories([...categories, { id: docRef.id, name: newCategory }]);
     toast.success(`Category "${newCategory}" added ✅`);
    setNewCategory("");
  };

  const deleteCategory = async (id, catName) => {
  await deleteDoc(doc(db, "category", id));
  setCategories(categories.filter((cat) => cat.id !== id));
  toast.error(`Category "${catName}" deleted ❌`);
};

  const openUpdateModal = (cat) => {
    setEditingCategory(cat);
    setEditName(cat.name);
    setOpenMenu(null); // close dropdown
  };

  const handleUpdate = async () => {
    if (!editName.trim()) return;
    await updateDoc(doc(db, "category", editingCategory.id), {
      name: editName,
    });
    setCategories(
      categories.map(cat =>
        cat.id === editingCategory.id ? { ...cat, name: editName } : cat
      )
    );
    setEditingCategory(null); // close modal
    setEditName("");
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row overflow-x-hidden">
         <Toaster position="top-right" reverseOrder={false} />
      
      {/* Sidebar */}
      <Sidebar className="w-full md:w-64" />

      {/* Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-16"
         style={{ backgroundColor: "#FAF3E0" }}
      >
        
        <h1 className="text-3xl font-bold mb-6">Manage Categories</h1>
        {/* Input + Add */}
        <div className="mb-6 flex flex-col sm:flex-row gap-2 w-full">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New Category"
            className="border p-2 rounded flex-1 w-full"
          />
          <button
            onClick={addCategory}
            className="text-white px-4 py-2 rounded w-full sm:w-auto"
            style={{ backgroundColor: "#3D441E" }}
          >
            Add
          </button>
        </div>

        {/* Categories List */}
        <ul className="space-y-2 w-full relative">
          {categories.map((cat) => (
            <li
              key={cat.id}
              className="p-3 border-b-2 flex justify-between items-center text-sm sm:text-base relative"
            >
              <span className="truncate">{cat.name}</span>

              {/* 3 dots menu */}
              <div className="relative">
                <button
                  onClick={() =>
                    setOpenMenu(openMenu === cat.id ? null : cat.id)
                  }
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <HiDotsVertical size={18} />
                </button>

                {/* Dropdown */}
                {openMenu === cat.id && (
                  <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg z-10" ref={menuRef}>
                    <button
                      onClick={() => openUpdateModal(cat)}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => {
                        setOpenMenu(null);
                        deleteCategory(cat.id, cat.name);
                      }}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </main>

      {/* Update Modal */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h2 className="text-xl font-bold mb-4">Update Category</h2>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="border p-2 rounded w-full mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingCategory(null)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 text-white rounded"
                style={{ backgroundColor: "#3D441E" }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
