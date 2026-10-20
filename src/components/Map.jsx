import { useRef, useEffect, useState } from "react";
import * as mapboxgl from "mapbox-gl/esm";
import "mapbox-gl/dist/mapbox-gl.css";
import nigeriaFoods from "../data/NigeiaFoods";

const Map = () => {
  const mapRef = useRef();
  const mapContainerRef = useRef();
  const markersRef = useRef([]);
  const accessToken = import.meta.env.VITE_MAPBOX_ACCESSTOKEN;

  const [selectedFood, setSelectedFood] = useState(null);
  const [activeZone, setActiveZone] = useState("all");

  const filteredFoods = nigeriaFoods.filter((food) => {
    if (activeZone === "all") return true;
    return food.zone === activeZone;
  });

  // =========================
  // CREATE MAP
  // =========================
  useEffect(() => {
    mapRef.current = new mapboxgl.Map({
      accessToken: accessToken,
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [8.6753, 9.082],
      zoom: 5,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  // =========================
  // CREATE / UPDATE MARKERS
  // =========================
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    filteredFoods.forEach((food) => {
      const isSelected = selectedFood?.id === food.id;

      const el = document.createElement("div");

      el.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
        ">
          <div style="
            width: ${isSelected ? "44px" : "36px"};
            height: ${isSelected ? "44px" : "36px"};
            background: ${food.zoneColor};
            border-radius: 50%;
            border: ${isSelected ? "3px" : "2px"} solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${isSelected ? "22px" : "18px"};
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            transition: all 0.2s;
          ">
            ${food.emoji}
          </div>

          <div style="
            font-size: 9px;
            font-weight: 600;
            background: rgba(255,255,255,0.95);
            padding: 1px 6px;
            border-radius: 4px;
            margin-top: 2px;
            white-space: nowrap;
            color: #333;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          ">
            ${food.dish}
          </div>
        </div>
      `;

      el.addEventListener("click", () => {
        setSelectedFood(food);

        if (mapRef.current) {
          mapRef.current.flyTo({
            center: food.coordinates,
            zoom: 5,
            duration: 1200,
          });
        }
      });

      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
      }).setHTML(`
        <div style="font-size:12px;font-weight:600">
          ${food.emoji} ${food.dish}
        </div>
        <div style="font-size:10px;color:#666">
          ${food.state} · ${food.zone}
        </div>
      `);

      const marker = new mapboxgl.Marker({
        element: el,
      })
        .setLngLat(food.coordinates)
        .setPopup(popup)
        .addTo(mapRef.current);

      markersRef.current.push(marker);
    });
  }, [filteredFoods, selectedFood]);

  // =========================
  // ZONES
  // =========================
  const zones = [
    {
      value: "all",
      label: "All zones",
      color: "#8B1A1A",
    },
    {
      value: "North West",
      label: "North West",
      color: "#E07B39",
    },
    {
      value: "North East",
      label: "North East",
      color: "#185FA5",
    },
    {
      value: "North Central",
      label: "North Central",
      color: "#9b59b6",
    },
    {
      value: "South West",
      label: "South West",
      color: "#1D9E75",
    },
    {
      value: "South East",
      label: "South East",
      color: "#E24B4A",
    },
    {
      value: "South South",
      label: "South South",
      color: "#2C5F2E",
    },
  ];

  // =========================
  // RESET MAP
  // =========================
  const resetMap = () => {
    setSelectedFood(null);

    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [8.6753, 9.082],
        zoom: 5,
        duration: 1200,
      });
    }
  };

  return (
    <div className="min-h-screen">
      {/* ================= HEADER ================= */}
      <header className="bg-[#8B1A1A]">
        <div
          className="
            flex flex-col
            lg:flex-row
            lg:items-center
            lg:justify-between
            gap-4
            p-4
          "
        >
          {/* LOGO */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-gray-300 bg-opacity-20 p-2 rounded-lg text-xl">
              🍲
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-200">
                NaijaFoods
              </h1>

              <p className="text-red-200 text-xs sm:text-sm">
                Traditional dishes across Nigeria
              </p>
            </div>
          </div>

          {/* SEARCH */}
          <div className="w-full lg:w-[45%] xl:w-[55%]">
            <input
              type="text"
              placeholder="Search dishes or states..."
              className="
                w-full
                py-2.5
                px-4
                rounded-lg
                bg-white
                bg-opacity-10
                border
                border-white
                border-opacity-20
                text-white
                placeholder-red-200
                outline-none
                text-sm
              "
            />
          </div>

          {/* STATS */}
          <div
            className="
              flex
              justify-between
              sm:justify-start
              gap-5
              sm:gap-6
              w-full
              lg:w-auto
            "
          >
            <div className="text-center">
              <p className="text-white font-bold">36</p>
              <p className="text-red-200 text-xs">States</p>
            </div>

            <div className="text-center">
              <p className="text-white font-bold">6</p>
              <p className="text-red-200 text-xs">Zones</p>
            </div>

            <div className="text-center">
              <p className="text-white font-bold">{nigeriaFoods.length}</p>
              <p className="text-red-200 text-xs">Dishes</p>
            </div>
          </div>
        </div>
      </header>

      {/* ================= ZONE FILTERS ================= */}
      <div
        className="
          p-3
          flex
          items-center
          gap-3
          overflow-x-auto
          border-b
          border-gray-200
          scrollbar-thin
        "
      >
        <span className="text-xs text-gray-400 whitespace-nowrap">
          Filter by zone:
        </span>

        {zones.map((zone) => (
          <button
            key={zone.value}
            onClick={() => setActiveZone(zone.value)}
            className={`
              py-1.5
              px-3
              flex
              items-center
              gap-2
              border
              rounded-full
              text-xs
              whitespace-nowrap
              transition-colors
              shrink-0
              ${
                activeZone === zone.value
                  ? "font-medium border-2"
                  : "border-gray-300 text-gray-600 bg-white hover:bg-gray-50"
              }
            `}
            style={
              activeZone === zone.value
                ? {
                    background: zone.color + "20",
                    borderColor: zone.color,
                    color: zone.color,
                  }
                : {}
            }
          >
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{
                background: zone.color,
              }}
            ></div>

            {zone.label}
          </button>
        ))}
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div
        className="
          flex
          flex-col
          lg:flex-row
          w-full
          min-h-[calc(100vh-150px)]
        "
      >
        {/* ================= MAP ================= */}
        <div
          className="
            w-full
            lg:w-[70%]
            h-[55vh]
            sm:h-[60vh]
            lg:h-[calc(100vh-150px)]
            shrink-0
          "
        >
          <div id="map" ref={mapContainerRef} className="w-full h-full"></div>
        </div>

        {/* ================= SIDEBAR ================= */}
        <div
          className="
            w-full
            lg:w-[30%]
            min-h-[45vh]
            lg:h-[calc(100vh-150px)]
            overflow-y-auto
            border-t
            lg:border-t-0
            lg:border-l
            border-gray-200
          "
        >
          {/* ================= NO FOOD SELECTED ================= */}
          {!selectedFood && (
            <div className="flex justify-center items-center flex-col p-4">
              <div className="text-5xl">🍲</div>

              <h3 className="mt-3 font-semibold text-gray-700 text-center">
                Explore Nigerian Cuisine
              </h3>

              <p className="text-center text-sm text-gray-400 mt-3 max-w-md">
                Click any food pin on the map to learn about traditional
                Nigerian dishes
              </p>

              {/* FOOD GRID */}
              <div
                className="
                  grid
                  grid-cols-2
                  sm:grid-cols-3
                  lg:grid-cols-2
                  xl:grid-cols-3
                  gap-2
                  w-full
                  mt-7
                "
              >
                {filteredFoods.map((food) => (
                  <div
                    key={food.id}
                    onClick={() => {
                      setSelectedFood(food);

                      if (mapRef.current) {
                        mapRef.current.flyTo({
                          center: food.coordinates,
                          zoom: 5,
                          duration: 1500,
                        });
                      }
                    }}
                    className="
                      border
                      border-gray-300
                      rounded-lg
                      px-2
                      py-3
                      text-center
                      cursor-pointer
                      hover:bg-gray-50
                      transition
                    "
                  >
                    <span className="text-2xl">{food.emoji}</span>

                    <p className="text-xs text-gray-500 leading-tight mt-1">
                      {food.dish}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= SELECTED FOOD ================= */}
          {selectedFood && (
            <div>
              {/* FOOD HERO */}
              <div
                className="
                  p-4
                  min-h-[150px]
                "
                style={{
                  background: `linear-gradient(
                    135deg,
                    ${selectedFood.zoneColor},
                    ${selectedFood.zoneColor}88
                  )`,
                }}
              >
                <div className="flex justify-between items-center">
                  <div className="text-xs font-semibold text-gray-200">
                    {selectedFood.zone}
                  </div>

                  <button
                    className="
                      h-8
                      w-8
                      rounded-full
                      bg-white
                      text-black
                      cursor-pointer
                      flex
                      justify-center
                      items-center
                      font-medium
                    "
                    onClick={resetMap}
                  >
                    ×
                  </button>
                </div>

                <div className="flex justify-center items-center mt-4">
                  <h1 className="text-5xl">{selectedFood.emoji}</h1>
                </div>
              </div>

              {/* FOOD INFORMATION */}
              <div className="p-4">
                <p className="text-xs text-gray-400">
                  📍 {selectedFood.state} · {selectedFood.zone}
                </p>

                <h2 className="mt-3 text-xl font-bold text-gray-700">
                  {selectedFood.dish}
                </h2>

                <p className="leading-relaxed text-sm mt-3 text-gray-600">
                  {selectedFood.description}
                </p>

                {/* KEY INGREDIENTS */}
                <h2 className="text-lg font-semibold mt-5 text-gray-600">
                  Key ingredients
                </h2>

                <div className="flex gap-2 flex-wrap mt-2">
                  {selectedFood.ingredients.map((ingredient, i) => (
                    <div key={i}>
                      <p className="text-xs bg-gray-100 rounded-full py-1.5 px-4 text-gray-600">
                        {ingredient}
                      </p>
                    </div>
                  ))}
                </div>

                {/* ALSO POPULAR */}
                <h2 className="text-lg font-semibold mt-5 text-gray-600">
                  Also popular in
                </h2>

                <div className="flex gap-2 flex-wrap mt-2">
                  {selectedFood.alsoPopularIn.map((popular, i) => (
                    <div key={i}>
                      <p
                        className="
                            text-xs
                            rounded-full
                            py-1.5
                            px-4
                            text-white
                          "
                        style={{
                          background: selectedFood.zoneColor,
                        }}
                      >
                        {popular}
                      </p>
                    </div>
                  ))}
                </div>

                {/* BUTTONS */}
                <div
                  className="
                    flex
                    flex-col
                    sm:flex-row
                    gap-2
                    mt-5
                    pt-3
                    border-t
                  "
                >
                  <button
                    onClick={() =>
                      window.open(
                        `https://www.google.com/search?q=how+to+cook+${selectedFood.dish}+Nigerian+recipe`,
                        "_blank",
                      )
                    }
                    className="
                      flex-1
                      mt-1
                      py-2
                      px-4
                      rounded-lg
                      text-sm
                      text-white
                      cursor-pointer
                    "
                    style={{
                      background: selectedFood.zoneColor,
                    }}
                  >
                    🔍 Find recipe
                  </button>

                  <button
                    className="
                      flex-1
                      mt-1
                      border
                      border-gray-300
                      py-2
                      px-4
                      rounded-lg
                      text-sm
                      text-gray-600
                      cursor-pointer
                      hover:bg-gray-50
                    "
                    onClick={resetMap}
                  >
                    ← Back
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Map;
