import './App.css';
import { useState, useEffect } from "react";
import { db } from './firebase';
import { collection, getDocs } from "firebase/firestore";
import Menu from './pages/Menu';
import Welcome from './pages/Welcome';

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
    <>
      {activeCategory ? (
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
      )}
    </>
  );
}

export default App;
