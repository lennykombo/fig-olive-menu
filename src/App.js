import './App.css';
import { useState, useEffect } from "react";
import { db } from './firebase';
import { collection, getDocs } from "firebase/firestore";
import Menu from './pages/Menu';
import Welcome from './pages/Welcome';
import PrivateRoute from './componets/PrivateRoute';
import Login from './pages/Login'

// admin pages
import Dashboard from './pages/Dashboard';
//import Categories from './pages/admin/Categories';
import MenuItems from './pages/Dashmenu';

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "category"));
        const categoryList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name
        }));
        setCategories(categoryList);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={
            activeCategory ? (
              <Menu
                activeTab={activeCategory}
                onBack={() => setActiveCategory(null)}
                categories={categories}
              />
            ) : (
              <Welcome
                categories={categories}
                onSelect={(catId) => setActiveCategory(catId)}
              />
            )
          }
        />
<Route path="/login" element={<Login />} />
        {/* Admin routes */}
        <Route path="/admin" element={
          <PrivateRoute>
          <Dashboard />
          </PrivateRoute>
        } />
        {/*<Route path="/admin/categories" element={<Categories />} />*/}
        <Route path="/dashmenu" element={
          <PrivateRoute>
          <MenuItems />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
