// src/pages/admin/Dashboard.jsx
import { useState, useEffect, useRef } from "react";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import toast, { Toaster } from "react-hot-toast";
import Sidebar from "../componets/Sidebar";
import { HiDotsVertical } from "react-icons/hi";

const Dashboard = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [newSubcategory, setNewSubcategory] = useState({});
  const [openMenu, setOpenMenu] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState("");
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [editSubName, setEditSubName] = useState("");
  const [openSubMenu, setOpenSubMenu] = useState(null);


  const menuRef = useRef();
  const subMenuRefs = useRef({});

  // Fetch categories + subcategories
  useEffect(() => {
    const fetchData = async () => {
      const catSnap = await getDocs(collection(db, "category"));
      setCategories(catSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

      const subSnap = await getDocs(collection(db, "subcategory"));
      setSubcategories(
        subSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    };
    fetchData();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


useEffect(() => {
  function handleClickOutside(event) {
    if (
      openSubMenu &&
      subMenuRefs.current[openSubMenu] &&
      !subMenuRefs.current[openSubMenu].contains(event.target)
    ) {
      setOpenSubMenu(null);
    }
  }

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [openSubMenu]);


  // --- CATEGORY FUNCTIONS ---
  const addCategory = async () => {
    if (!newCategory.trim()) return;
    const docRef = await addDoc(collection(db, "category"), {
      name: newCategory,
    });
    setCategories([...categories, { id: docRef.id, name: newCategory }]);
    toast.success(`Category "${newCategory}" added ✅`);
    setNewCategory("");
  };

  /*const deleteCategory = async (id, catName) => {
    await deleteDoc(doc(db, "category", id));
    setCategories(categories.filter((cat) => cat.id !== id));

    // also remove linked subcategories
    const linkedSubs = subcategories.filter((sub) => sub.categoryId === id);
    linkedSubs.forEach(async (sub) => {
      await deleteDoc(doc(db, "subcategory", sub.id));
    });
    setSubcategories(subcategories.filter((sub) => sub.categoryId !== id));

    toast.error(`Category "${catName}" deleted ❌`);
  };*/

  const deleteCategory = async (id, catName) => {
  try {
    let menuCount = 0;
    let subCount = 0;

    // 1. Delete menu items linked directly to this category
    const menuRef = collection(db, "menu");
    const qMenu = query(menuRef, where("category", "==", id));
    const menuSnap = await getDocs(qMenu);

    menuCount += menuSnap.size;
    await Promise.all(menuSnap.docs.map((docSnap) => deleteDoc(doc(db, "menu", docSnap.id))));

    // 2. Delete subcategories + their menu items
    const linkedSubs = subcategories.filter((sub) => sub.categoryId === id);
    for (const sub of linkedSubs) {
      subCount++;

      const qSubMenu = query(menuRef, where("subcategoryId", "==", sub.id));
      const subMenuSnap = await getDocs(qSubMenu);
      menuCount += subMenuSnap.size;

      await Promise.all(subMenuSnap.docs.map((docSnap) => deleteDoc(doc(db, "menu", docSnap.id))));
      await deleteDoc(doc(db, "subcategory", sub.id));
    }

    // 3. Delete the category itself
    await deleteDoc(doc(db, "category", id));

    // 4. Update state
    setCategories(categories.filter((cat) => cat.id !== id));
    setSubcategories(subcategories.filter((sub) => sub.categoryId !== id));

    toast.error(
      `Category "${catName}" deleted ❌ (Removed ${subCount} subcategories, ${menuCount} menu items)`
    );
  } catch (error) {
    console.error("Error deleting category and linked data:", error);
    toast.error("Failed to delete category ❌");
  }
};


  const openUpdateModal = (cat) => {
    setEditingCategory(cat);
    setEditName(cat.name);
    setOpenMenu(null);
  };

  const handleUpdate = async () => {
    if (!editName.trim()) return;
    await updateDoc(doc(db, "category", editingCategory.id), {
      name: editName,
    });
    setCategories(
      categories.map((cat) =>
        cat.id === editingCategory.id ? { ...cat, name: editName } : cat
      )
    );
    setEditingCategory(null);
    setEditName("");
  };

  // --- SUBCATEGORY FUNCTIONS ---
  const handleAddSubcategory = async (catId) => {
    if (!newSubcategory[catId]?.trim()) return;
    const docRef = await addDoc(collection(db, "subcategory"), {
      name: newSubcategory[catId],
      categoryId: catId,
    });
    setSubcategories([
      ...subcategories,
      { id: docRef.id, name: newSubcategory[catId], categoryId: catId },
    ]);
    toast.success(`Subcategory "${newSubcategory[catId]}" added ✅`);
    setNewSubcategory({ ...newSubcategory, [catId]: "" });
  };

  /*const handleDeleteSubcategory = async (subId, subName) => {
    await deleteDoc(doc(db, "subcategory", subId));
    setSubcategories(subcategories.filter((sub) => sub.id !== subId));
    toast.error(`Subcategory "${subName}" deleted ❌`);
  };*/

  const handleDeleteSubcategory = async (subId, subName) => {
  try {
    // 1. Delete menu items linked to this subcategory
    const menuRef = collection(db, "menu");
    const q = query(menuRef, where("subcategoryId", "==", subId));
    const snapshot = await getDocs(q);

    const menuCount = snapshot.size;
    await Promise.all(snapshot.docs.map((docSnap) => deleteDoc(doc(db, "menu", docSnap.id))));

    // 2. Delete the subcategory itself
    await deleteDoc(doc(db, "subcategory", subId));

    // 3. Update state
    setSubcategories(subcategories.filter((sub) => sub.id !== subId));

    toast.error(
      `Subcategory "${subName}" deleted ❌ (Removed ${menuCount} menu items)`
    );
  } catch (error) {
    console.error("Error deleting subcategory and menu items:", error);
    toast.error("Failed to delete subcategory ❌");
  }
};

const openUpdateSubModal = (sub) => {
  setEditingSubcategory(sub);
  setEditSubName(sub.name);
};

const handleUpdateSubcategory = async () => {
  if (!editSubName.trim()) return;
  await updateDoc(doc(db, "subcategory", editingSubcategory.id), {
    name: editSubName,
  });

  // update local state
  setSubcategories(
    subcategories.map((sub) =>
      sub.id === editingSubcategory.id ? { ...sub, name: editSubName } : sub
    )
  );

  setEditingSubcategory(null);
  setEditSubName("");
  toast.success(`Subcategory updated ✅`);
};


  return (
    <div className="flex min-h-screen flex-col md:flex-row overflow-x-hidden">
      <Toaster position="top-right" reverseOrder={false} />

      {/* Sidebar */}
      <Sidebar className="w-full md:w-64" />

      {/* Content */}
      <main
        className="flex-1 p-4 sm:p-6 lg:p-8 pt-16"
        style={{ backgroundColor: "#FAF3E0" }}
      >
        <h1 className="text-3xl font-bold mb-6">Manage Categories</h1>

        {/* Add Category */}
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

        {/* Categories + Subcategories */}
        <ul className="space-y-4 w-full relative">
          {categories.map((cat) => (
            <li
              key={cat.id}
              className="p-3 border rounded bg-white shadow-sm text-sm sm:text-base relative"
            >
              <div className="flex justify-between items-center">
                <span className="truncate font-bold">{cat.name}</span>

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
                    <div
                      className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg z-10"
                      ref={menuRef}
                    >
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
              </div>

              {/* Subcategories */}
              <div className="ml-6 mt-3 space-y-2">
                {/*subcategories
                  .filter((sub) => sub.categoryId === cat.id)
                  .map((sub) => (
                    <div
                      key={sub.id}
                      className="flex justify-between items-center border-b pb-1"
                    >
                      <span className="text-gray-700">{sub.name}</span>
                      <button
                        onClick={() =>
                          handleDeleteSubcategory(sub.id, sub.name)
                        }
                        className="text-xs text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  ))*/}
                       {subcategories
  .filter((sub) => sub.categoryId === cat.id)
  .map((sub) => (
    <div
      key={sub.id}
      className="flex justify-between items-center border-b pb-1 relative"
    >
      <span className="text-gray-700">{sub.name}</span>

      {/* 3 dots button */}
      <div
        className="relative"
        ref={(el) => (subMenuRefs.current[sub.id] = el)}
      >
        <button
          onClick={() =>
            setOpenSubMenu(openSubMenu === sub.id ? null : sub.id)
          }
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <HiDotsVertical size={16} />
        </button>

        {/* Dropdown menu */}
        {openSubMenu === sub.id && (
          <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg z-10">
            <button
              onClick={() => {
                setOpenSubMenu(null);
                openUpdateSubModal(sub);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Update
            </button>
            <button
              onClick={() => {
                setOpenSubMenu(null);
                handleDeleteSubcategory(sub.id, sub.name);
              }}
              className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  ))}


                {/* Add subcategory input */}
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newSubcategory[cat.id] || ""}
                    onChange={(e) =>
                      setNewSubcategory({
                        ...newSubcategory,
                        [cat.id]: e.target.value,
                      })
                    }
                    placeholder="New Subcategory"
                    className="border p-1 rounded flex-1"
                  />
                  <button
                    onClick={() => handleAddSubcategory(cat.id)}
                    className="bg-green-600 text-white px-2 rounded"
                  >
                    +
                  </button>
                </div>
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

      {editingSubcategory && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
    <div className="bg-white p-6 rounded shadow-lg w-80">
      <h2 className="text-xl font-bold mb-4">Update Subcategory</h2>
      <input
        type="text"
        value={editSubName}
        onChange={(e) => setEditSubName(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      />
      <div className="flex justify-end gap-2">
        <button
          onClick={() => setEditingSubcategory(null)}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Cancel
        </button>
        <button
          onClick={handleUpdateSubcategory}
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
