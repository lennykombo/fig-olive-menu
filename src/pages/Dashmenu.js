import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase"; 
import toast, { Toaster } from "react-hot-toast";
//import { MoreVertical } from "lucide-react";
//import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Sidebar from "../componets/Sidebar";

const Dashmenu = () => {
  const [categories, setCategories] = useState([]);
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    subcategoryId:"",
    image: null,
  });
  const [menuItems, setMenuItems] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, itemId: null, itemName: "" });
  const [updateModal, setUpdateModal] = useState({
  open: false,
  itemId: null,
  name: "",
  description: "",
  price: "",
  categoryId: "",
  subcategoryId: "",
});
const [searchQuery, setSearchQuery] = useState("");
const [subcategories, setSubcategories] = useState([]);


useEffect(() => {
  const fetchSubcategories = async () => {
    try {
      const snapshot = await getDocs(collection(db, "subcategory"));
      setSubcategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error fetching subcategories:", err);
    }
  };
  fetchSubcategories();
}, []);


useEffect(() => {
  const fetchMenuItems = async () => {
    try {
      const snapshot = await getDocs(collection(db, "menu"));
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMenuItems(items);
    } catch (err) {
      console.error("Error fetching menu items:", err);
    }
  };

  fetchMenuItems();
}, []);


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const snapshot = await getDocs(collection(db, "category"));
        setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setNewItem({ ...newItem, [e.target.name]: e.target.value });
  };

  /*const handleImageUpload = (e) => {
    setNewItem({ ...newItem, image: e.target.files[0] });
  };*/

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await addDoc(collection(db, "menu"), {
      name: newItem.name,
      //description: newItem.description,
      price: newItem.price,
      category: newItem.categoryId,
      //subcategoryId: newItem.subcategoryId,
        createdAt: new Date(),
      ...(newItem.description && { description: newItem.description }),
      ...(newItem.subcategoryId && { subcategoryId: newItem.subcategoryId }) 
    });

    toast.success(`${newItem.name} has been added to the menu!`);
    // Fetch updated menu items
   const snapshot = await getDocs(collection(db, "menu"));
   setMenuItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    setNewItem({
      name: "",
      description: "",
      price: "",
      categoryId: "",
    });
  } catch (err) {
    console.error("Error adding menu item:", err);
  }
};

const toggleMenu = (id) => {
  setOpenMenuId(openMenuId === id ? null : id);
};

const fetchMenuItems = async () => {
  try {
    const snapshot = await getDocs(collection(db, "menu"));
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setMenuItems(items);
  } catch (err) {
    console.error("Error fetching menu items:", err);
  }
};

useEffect(() => {
  fetchMenuItems();
}, []);

useEffect(() => {
  const handleClickOutside = () => setOpenMenuId(null);
  document.addEventListener("click", handleClickOutside);
  return () => document.removeEventListener("click", handleClickOutside);
}, []);

// 1. Map categories
const categoryMap = categories.reduce((map, cat) => {
  map[cat.id] = cat.name;
  return map;
}, {});

// 2. Map subcategories
const subcategoryMap = subcategories.reduce((map, sub) => {
  map[sub.id] = { name: sub.name, categoryId: sub.categoryId };
  return map;
}, {});

// 3. Filter menu items (keep only once)
/*const filteredMenu = menuItems.filter(item => {
  const itemNameMatch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
  const categoryNameMatch = (categoryMap[item.category] || "")
    .toLowerCase()
    .includes(searchQuery.toLowerCase());
  return itemNameMatch || categoryNameMatch;
});*/
// 3. Filter menu items (keep only once)
const filteredMenu = menuItems.filter(item => {
  const itemNameMatch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
  const categoryNameMatch = (categoryMap[item.category] || "")
    .toLowerCase()
    .includes(searchQuery.toLowerCase());
  const subcategoryNameMatch = item.subcategoryId
    ? (subcategoryMap[item.subcategoryId]?.name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    : false;

  return itemNameMatch || categoryNameMatch || subcategoryNameMatch;
});


// 4. Group menu items into Category → Subcategory → Items
const groupedMenu = {};

filteredMenu.forEach((item) => {
  const categoryName = categoryMap[item.category] || "Unknown Category";
  const sub = subcategoryMap[item.subcategoryId]; // ✅ match your DB field
  const subcategoryName = sub ? sub.name : " ";

  if (!groupedMenu[categoryName]) groupedMenu[categoryName] = {};
  if (!groupedMenu[categoryName][subcategoryName]) groupedMenu[categoryName][subcategoryName] = [];

  groupedMenu[categoryName][subcategoryName].push(item);
});


const isSearching = searchQuery.trim() !== "";


  return (
    <div className="flex min-h-screen gap-7"
       style={{ backgroundColor: "#FAF3E0" }}
    >
      <Toaster position="top-right" reverseOrder={false} />

      {/* Sidebar */}
      <Sidebar className="w-64 flex-shrink-0" />
     <div className="flex-1">
      <h2 className="text-xl font-bold mb-4 px-6 pt-16">Add Menu Item</h2>
      <form onSubmit={handleSubmit} className="space-y-4 px-4">
        <input
          type="text"
          name="name"
          placeholder="Item Name"
          value={newItem.name}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={newItem.description}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={newItem.price}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        />
        <select
          name="categoryId"
          value={newItem.categoryId}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        >
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
  name="subcategoryId"
  value={newItem.subcategoryId}
  onChange={handleChange}
  className="border p-2 w-full rounded"
  disabled={!newItem.categoryId} // ✅ disable until category is chosen
>
  <option value="">Select Subcategory</option>
  {subcategories
    .filter(sub => sub.categoryId === newItem.categoryId) // ✅ show only relevant
    .map(sub => (
      <option key={sub.id} value={sub.id}>
        {sub.name}
      </option>
    ))}
</select>

        
        <button
          type="submit"
          className="text-white px-4 py-2 rounded"
          style={{ backgroundColor: "#3D441E" }}
        >
          Add Item
        </button>
      </form>
              <div className="mt-10 px-4">
  <h3 className="text-lg font-semibold mb-4">Menu Items</h3>
  <div className="px-4 mb-4">
  <input
    type="text"
    placeholder="Search by menu item, subcategory or category..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="border p-2 w-full rounded"
  />
</div>
<div  className={`px-4 ${
    isSearching
      ? "flex flex-col gap-6"       // Single column for search
      : "columns-1 md:columns-2 lg:columns-3 gap-6" // Masonry for full menu
  }`}>
  {Object.keys(groupedMenu).length === 0 ? (
  <p className="text-gray-500">No items found.</p>
) : (
  Object.entries(groupedMenu).map(([categoryName, subcats]) => (
    <div key={categoryName} className="mb-8">
      {/* Category Title */}
      <h2 className="text-2xl font-bold mb-4">{categoryName}</h2>

      {/* Loop subcategories */}
      {Object.entries(subcats).map(([subcatName, items]) => (
        <div key={subcatName} className="ml-6 mb-6">
          <h3 className="text-lg font-semibold mb-2">{subcatName}</h3>

          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="p-4 bg-white rounded shadow flex justify-between items-center relative"
              >
                {/* Left: Item info */}
                <div>
                  <h4 className="font-bold">{item.name}</h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>

                {/* Right: Price + actions */}
                <div className="flex items-center gap-4 relative">
                  <span className="font-medium">{item.price}</span>

                  {/* Three dots button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMenu(item.id);
                    }}
                    className="p-1 rounded hover:bg-gray-100"
                  >
                    ⋮
                  </button>

                  {/* Dropdown menu */}
                  {openMenuId === item.id && (
                    <div
                      className="absolute right-0 top-8 w-32 bg-white border rounded shadow-md z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() =>
                          setUpdateModal({
                            open: true,
                            itemId: item.id,
                            name: item.name,
                            description: item.description,
                            price: item.price,
                            categoryId: item.category,
                            subcategoryId: item.subcategoryId,
                          })
                        }
                        className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                      >
                        Update
                      </button>
                      <button
                        onClick={() =>
                          setDeleteModal({
                            open: true,
                            itemId: item.id,
                            itemName: item.name,
                          })
                        }
                        className="block w-full px-4 py-2 text-left text-red-600 hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  ))
)}

</div>
</div>


      </div>
      {deleteModal.open && (
  <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded shadow-lg w-80">
      <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
      <p className="mb-6">Are you sure you want to delete "{deleteModal.itemName}"?</p>
      <div className="flex justify-end gap-4">
        <button
          onClick={() => setDeleteModal({ open: false, itemId: null, itemName: "" })}
          className="px-4 py-2 rounded border hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={async () => {
            await deleteDoc(doc(db, "menu", deleteModal.itemId));
            toast.success(`${deleteModal.itemName} deleted`);
            fetchMenuItems();
            setDeleteModal({ open: false, itemId: null, itemName: "" });
          }}
          className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}

{updateModal.open && (
  <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded shadow-lg w-96">
      <h3 className="text-lg font-bold mb-4">Update Menu Item</h3>

      <input
        type="text"
        placeholder="Name"
        value={updateModal.name}
        onChange={(e) =>
          setUpdateModal({ ...updateModal, name: e.target.value })
        }
        className="border p-2 w-full rounded mb-2"
      />
      <textarea
        placeholder="Description"
        value={updateModal.description}
        onChange={(e) =>
          setUpdateModal({ ...updateModal, description: e.target.value })
        }
        className="border p-2 w-full rounded mb-2"
      />
      <input
        type="number"
        placeholder="Price"
        value={updateModal.price}
        onChange={(e) =>
          setUpdateModal({ ...updateModal, price: e.target.value })
        }
        className="border p-2 w-full rounded mb-2"
      />
      <select
  value={updateModal.subcategoryId || ""}
  onChange={(e) =>
    setUpdateModal({ ...updateModal, subcategoryId: e.target.value })
  }
  className="border p-2 w-full rounded mb-4"
  disabled={!updateModal.categoryId} // disable until category chosen
>
  <option value="">Select Subcategory</option>
  {subcategories
    .filter((sub) => sub.categoryId === updateModal.categoryId)
    .map((sub) => (
      <option key={sub.id} value={sub.id}>
        {sub.name}
      </option>
    ))}
</select>

      <select
        value={updateModal.categoryId}
        onChange={(e) =>
          setUpdateModal({ ...updateModal, categoryId: e.target.value })
        }
        className="border p-2 w-full rounded mb-4"
      >
        <option value="">Select Category</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      <div className="flex justify-end gap-4">
        <button
          onClick={() =>
            setUpdateModal({
              open: false,
              itemId: null,
              name: "",
              description: "",
              price: "",
              categoryId: "",
            })
          }
          className="px-4 py-2 rounded border hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={async () => {
            await updateDoc(doc(db, "menu", updateModal.itemId), {
              name: updateModal.name,
              description: updateModal.description,
              price: updateModal.price,
              category: updateModal.categoryId,
              //subcategoryId: updateModal.subcategoryId,
              ...(updateModal.subcategoryId ? { subcategoryId: updateModal.subcategoryId } : {})
            });
            toast.success(`${updateModal.name} updated successfully`);
            fetchMenuItems();
            setUpdateModal({
              open: false,
              itemId: null,
              name: "",
              description: "",
              price: "",
              categoryId: "",
              subcategoryId:"",
            });
          }}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Update
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default Dashmenu;
