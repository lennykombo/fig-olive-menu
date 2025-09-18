import { useEffect, useState, useRef, useLayoutEffect, useMemo } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import logo from "../assets/figlogo.png";
import gsap from "gsap";

const Menu = ({ activeTab: initialTab, onBack, categories }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [menuData, setMenuData] = useState({});
  const [subcategories, setSubcategories] = useState([]); // ✅ keep state here
  const listRef = useRef(null);
  const scrollHintRef = useRef(null);
  const tabsRef = useRef(null);

  // sync activeTab with prop
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // fetch categories' subcategories
  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const snapshot = await getDocs(collection(db, "subcategory"));
        setSubcategories(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching subcategories:", err);
      }
    };
    fetchSubcategories();
  }, []);

  // fetch menu items
  useEffect(() => {
    const fetchMenu = async () => {
      const snapshot = await getDocs(collection(db, "menu"));
      const data = {};
      snapshot.forEach((doc) => {
        const item = { id: doc.id, ...doc.data() };
        if (!data[item.category]) data[item.category] = [];
        data[item.category].push(item);
      });
      setMenuData(data);
    };
    fetchMenu();
  }, []);

  // map subcategories
  const subcategoryMap = useMemo(() => {
    return subcategories.reduce((map, sub) => {
      map[sub.id] = { name: sub.name, categoryId: sub.categoryId };
      return map;
    }, {});
  }, [subcategories]);

  // items for current tab grouped by subcategory
  const itemsBySubcategory = useMemo(() => {
    const items = menuData[activeTab] ?? [];
    const grouped = {};

    items.forEach((item) => {
      const sub = subcategoryMap[item.subcategoryId];
      const subName = sub ? sub.name : "Main ";
      if (!grouped[subName]) grouped[subName] = [];
      grouped[subName].push(item);
    });

    return grouped;
  }, [menuData, activeTab, subcategoryMap]);

  // animate dish cards
  useLayoutEffect(() => {
    const root = listRef.current;
    if (!root) return;

    const items = root.querySelectorAll(".dish-card");
    if (!items.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        items,
        { autoAlpha: 0, y: 30 },
        {
          autoAlpha: 1,
          y: 0,
          stagger: 0.12,
          duration: 0.7,
          ease: "power3.out",
        }
      );
    }, root);

    return () => ctx.revert();
  }, [activeTab, itemsBySubcategory]);

  // GSAP animation for "Scroll →"
  useLayoutEffect(() => {
    if (!scrollHintRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(scrollHintRef.current, {
        x: 10, // move 10px to the right
        repeat: -1, // infinite
        yoyo: true, // back and forth
        duration: 0.5,
        ease: "power1.inOut",
      });
    });

    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
  if (!tabsRef.current) return;
  const items = tabsRef.current.children;
  gsap.fromTo(
    items,
    { autoAlpha: 0, y: 20 },
    { autoAlpha: 1, y: 0, stagger: 0.1, duration: 0.5, ease: "power2.out" }
  );
}, [categories]);

  return (
    <div className="relative min-h-screen text-gray-900 bg-amber-50">
      {/* Back + scroll hint */}
      <div className="flex items-center justify-between px-4">
        <button
          onClick={onBack}
          className="px-3 py-2 rounded-md bg-white/80 hover:bg-white text-olive font-medium shadow-sm transition"
        >
          ← Back
        </button>
        <span ref={scrollHintRef} className="flex items-center gap-1 mt-3 text-lime-700 font-medium animate-bounce-right">
          Scroll <span className="text-xl">→</span>
        </span>
      </div>

      {/* Tabs */}
        <div className="overflow-x-auto no-scrollbar border-b border-gray-300">
          <div ref={tabsRef} className="flex gap-6 px-4 py-2 justify-start md:justify-center">
            {categories.map((cat) => (
           <button
             key={cat.id}
             onClick={() => setActiveTab(cat.id)}
             className={`category-tab whitespace-nowrap text-md font-semibold px-3 py-1 rounded-md ${
             activeTab === cat.id
            ? "text-lime-700 border-b-2 border-lime-700 pb-1"
            : "text-gray-700"
           }`}
           >
            {cat.name}
          </button>

    ))}
  </div>
</div>


      {/* Menu list */}
      <div ref={listRef} className="p-6 space-y-6 max-w-3xl mx-auto">
        {Object.keys(itemsBySubcategory).map((subName) => (
          <div key={subName} className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">{subName}</h2>
            {itemsBySubcategory[subName].map((dish) => (
              <div
                key={dish.id}
                className="dish-card relative flex gap-4 items-start px-4 py-2 rounded-lg bg-white shadow-sm"
              >
                {dish.img && (
                  <img
                    src={dish.img}
                    alt={dish.name}
                    className="w-20 h-20 object-cover rounded-lg shadow"
                  />
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold">{dish.name}</h3>
                    <p className="text-lime-700 font-semibold ml-4 whitespace-nowrap">
                      {dish.price}
                    </p>
                  </div>
                  {dish.description && (
                    <p className="text-xs text-gray-700 mt-1">{dish.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}

        {Object.keys(itemsBySubcategory).length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <img src={logo} alt="Loading..." className="w-32 h-32 animate-pulse-scale" />
            <p className="mt-4 text-gray-600 font-medium">Loading menu...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
