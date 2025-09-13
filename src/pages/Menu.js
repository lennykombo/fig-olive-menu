import { useEffect, useState, useRef, useLayoutEffect, useMemo } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import logo from "../assets/figlogo.png";
import gsap from "gsap";

const Menu = ({ activeTab: initialTab, onBack, categories }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [menuData, setMenuData] = useState({});
  const listRef = useRef(null);

  // sync activeTab with prop
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Fetch menu items
  useEffect(() => {
    const fetchMenu = async () => {
      const snapshot = await getDocs(collection(db, "menu"));
      const data = {};
      snapshot.forEach((doc) => {
        const item = doc.data();
        if (!data[item.category]) data[item.category] = [];
        data[item.category].push(item);
      });
      setMenuData(data);
    };
    fetchMenu();
  }, []);

  // memoize menu items for current tab
  const itemsToShow = useMemo(
    () => menuData[activeTab] ?? [],
    [menuData, activeTab]
  );

  // animate dish cards entrance
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
  }, [activeTab, itemsToShow.length]);

  return (
    <div className="relative min-h-screen text-gray-900 bg-amber-50">
      <div
        id="spotlight"
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_var(--x,50%)_var(--y,50%),rgba(200,200,150,0.10),transparent_90%)]"
      />

      <div className="flex items-center justify-between px-4">
        {/* Back button */}
        <button
          onClick={onBack}
          className="px-3 py-2 rounded-md bg-white/80 hover:bg-white text-olive font-medium shadow-sm transition"
        >
          ← Back
        </button>

        {/* Scroll hint */}
        <span className="flex items-center gap-1 mt-3 text-lime-700 font-medium animate-bounce-right">
          Scroll <span className="text-xl">→</span>
        </span>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto no-scrollbar border-b border-gray-300">
        <div className="flex gap-6 px-4 py-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`whitespace-nowrap text-md font-semibold transition-colors ${
                activeTab === cat.id
                  ? "text-lime-700 border-b-2 border-lime-700 pb-2"
                  : "hover:text-lime-700"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu list */}
      <div ref={listRef} className="p-6 space-y-6 max-w-3xl mx-auto">
        {itemsToShow.map((dish, i) => (
          <div
            key={i}
            className={`dish-card relative flex gap-4 items-start px-4 py-2 rounded-lg bg-white transition-transform transform-gpu shadow-sm ${
              dish.premium ? "premium" : ""
            }`}
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
                <h3
                  className={`text-lg font-semibold ${
                    dish.premium ? "shimmer-text" : "text-gray-900"
                  }`}
                >
                  {dish.name}
                </h3>
                <p className="text-lime-700 font-semibold ml-4 whitespace-nowrap">
                  {dish.price}
                </p>
              </div>
              {dish.description && (
                <p className="text-xs text-gray-700 mt-1">
                  {dish.description}
                </p>
              )}
            </div>

            {dish.premium && (
              <span className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold shimmer-badge">
                Premium
              </span>
            )}
          </div>
        ))}

        {itemsToShow.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <img
              src={logo}
              alt="Loading..."
              className="w-32 h-32 animate-pulse-scale"
            />
            <p className="mt-4 text-gray-600 font-medium">Loading menu...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;





/*import { useEffect, useState, useRef, useMemo } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import logo from "../assets/figlogo.png"
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Menu = ({ activeTab: initialTab, onBack, categories }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [menuData, setMenuData] = useState({});
  const listRef = useRef(null);
 
 

  useEffect(() => { setActiveTab(initialTab); }, [initialTab]);


    // sync activeTab with prop
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);


  // Fetch menu items
  useEffect(() => {
    const fetchMenu = async () => {
      const snapshot = await getDocs(collection(db, "menu"));
      const data = {};
      snapshot.forEach(doc => {
        const item = doc.data();
        if (!data[item.category]) data[item.category] = [];
        data[item.category].push(item);
      });
      setMenuData(data);
    };
    fetchMenu();
  }, []);

  

   // memoize menu items for current tab
  const itemsToShow = useMemo(
    () => menuData[activeTab] ?? [],
    [menuData, activeTab]
  );

  // animate premium dishes glow
useEffect(() => {
  if (itemsToShow.length > 0) {
    const premiumItems = listRef.current?.querySelectorAll(".premium");

    if (!premiumItems || premiumItems.length === 0) return;

    gsap.killTweensOf(premiumItems);
    gsap.fromTo(
      premiumItems,
      {
        boxShadow: "0 0 6px rgba(85,107,47,0.3), 0 0 12px rgba(85,107,47,0.2)", // olive base
      },
      {
        boxShadow: "0 0 20px rgba(85,107,47,0.9), 0 0 40px rgba(85,107,47,0.6)", // strong olive glow
        duration: 1.6,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      }
    );
  }
}, [itemsToShow]);


  // animate dish cards on tab change with glow + pulsing
useEffect(() => {
  const items = listRef.current?.querySelectorAll(".dish-card");
  if (!items || items.length === 0) return;

  gsap.killTweensOf(items);

  // slide up + fade in
  gsap.fromTo(
    items,
    {
      autoAlpha: 0,
      y: 30,
      boxShadow: "0 0 0px rgba(0,0,0,0)", // start no glow
    },
    {
      autoAlpha: 1,
      y: 0,
      stagger: 0.15,
      duration: 0.7,
      ease: "power3.out",
      onComplete: () => {
        // after slide-in, start pulsing glow
        gsap.to(items, {
          boxShadow: "0 0 22px rgba(124,179,66,0.9), 0 0 40px rgba(124,179,66,0.5)",
          duration: 1.6,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
        });
      }
    }
  );
}, [activeTab]);


  return (
    <div className="relative min-h-screen text-gray-900 bg-amber-50">
      <div id="spotlight" className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_var(--x,50%)_var(--y,50%),rgba(200, 200, 150, 0.05),transparent_90%)]" />

      {/*<div className="flex items-center justify-between px-4">
        <button onClick={onBack} className="px-3 py-2 rounded-md bg-white/80 hover:bg-white text-olive font-medium shadow-sm transition">← Back</button>
        <div />
      </div>*
      <div className="flex items-center justify-between px-4">
  {/* Back button *
  <button
    onClick={onBack}
    className="px-3 py-2 rounded-md bg-white/80 hover:bg-white text-olive font-medium shadow-sm transition"
  >
    ← Back
  </button>

  {/* Scroll hint on the right *
  <span className="flex items-center gap-1 mt-3 text-lime-700 font-medium animate-bounce-right">
    Scroll <span className="text-xl">→</span>
  </span>
</div>


      {/* Tabs *
      <div className="overflow-x-auto no-scrollbar border-b border-gray-300">
        <div className="flex gap-6 px-2 py-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`whitespace-nowrap text-md font-semibold transition-colors ${
                activeTab === cat.id ? "text-lime-700 border-b-2 border-lime-700 pb-2" : "hover:text-lime-700"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu list *
      <div ref={listRef} className="p-6 space-y-6 max-w-3xl mx-auto">
        {itemsToShow.map((dish, i) => (
          <div
  key={i}
  className={`dish-card relative flex gap-4 items-start px-4 py-2 rounded-lg transition-transform transform-gpu 
    ${dish.premium ? "premium" : "border border-gray-200 shadow-sm hover:shadow-md"}
  `}
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
      <h3 className={`text-lg font-semibold ${dish.premium ? "shimmer-text" : "text-gray-900"}`}>
        {dish.name}
      </h3>
      <p className="text-lime-700 font-semibold ml-4 whitespace-nowrap">
        {dish.price}
      </p>
    </div>
    {dish.description && (
      <p className="text-xs text-gray-700 mt-1">{dish.description}</p>
    )}
  </div>

  {dish.premium && (
    <span className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold shimmer-badge">
      Premium
    </span>
  )}
</div>


        ))}

        {/*itemsToShow.length === 0 && <p className="text-center text-gray-600 py-8">No items in this category yet.</p>*
        {itemsToShow.length === 0 && (
      <div className="flex flex-col items-center justify-center py-16">
       <img
        src={logo}
        alt="Loading..."
        className="w-32 h-32 animate-pulse-scale"
      />
      <p className="mt-4 text-gray-600 font-medium">Loading menu...</p>
    </div>
    )}

      </div>
    </div>
  )
}

export default Menu;
*/