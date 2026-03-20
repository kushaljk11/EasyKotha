import React, { useState, useEffect, useRef } from "react";
import { Search as SearchIcon } from "lucide-react";
import { FaSearch } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../api/axios";

const Search = ({ 
  placeholder = "Find your next home...", 
  className = "", 
  value: externalValue, 
  onChange: externalOnChange,
  onSuggestionClick,
  basePath = "/tenant/explore",
  district,
  type
}) => {
  const [search, setSearch] = useState(externalValue || "");
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const getPostId = (item) => item?._id || item?.id || item?.postId || "";



  const fetchRecentSearches = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axiosInstance.get("/posts/recent-searches");
      if (response.data.success) {
        setRecentSearches(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching recent searches:", error);
    }
  };

  useEffect(() => {
    if (externalValue !== undefined) {
      setSearch(externalValue);
    }
  }, [externalValue]);

  const handleChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (externalOnChange) {
      externalOnChange(val);
    }
  };

  useEffect(() => {
    // Close suggestions when clicking outside
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Suggestions logic (Keyword Tracking)
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (search.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const response = await axiosInstance.get("/posts/suggestions", { 
          params: { 
            query: search,
            ...(district && { district }),
            ...(type && type !== "Property Type" && { type })
          } 
        });
        if (response.data.success) {
          setSuggestions(response.data.data);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [search, district, type]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setShowSuggestions(false);
    if (search.trim()) {
      const queryParams = new URLSearchParams(location.search);
      queryParams.set("search", search.trim());
      navigate(`${basePath}?${queryParams.toString()}`);
    }
  };

  const handleRecentClick = (keyword) => {
    setSearch(keyword);
    if (externalOnChange) externalOnChange(keyword);
    setShowSuggestions(false);
    
    const queryParams = new URLSearchParams(location.search);
    queryParams.set("search", keyword);
    navigate(`${basePath}?${queryParams.toString()}`);
  };

  return (
    <div className={`relative ${className}`} ref={suggestionRef}>
      <div className="relative group">
        <input
          type="text"
          placeholder={placeholder}
          className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-800/20 focus:bg-white focus:border-green-800 transition-all outline-none text-sm font-medium"
          value={search}
          onChange={handleChange}
          onFocus={() => {
            setShowSuggestions(true);
            fetchRecentSearches();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearchSubmit(e);
            }
          }}
        />
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-green-800 text-lg transition-colors" />
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || (search.length === 0 && recentSearches.length > 0)) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-10 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-300">
          
          {/* Recent Searches Section */}
          {search.length === 0 && recentSearches.length > 0 && (
            <>
              <div className="px-4 py-2 border-b border-gray-50 mb-1">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Recent Searches</p>
              </div>
              {recentSearches.map((keyword, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleRecentClick(keyword)}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3 group transition-colors"
                >
                  <SearchIcon size={12} className="text-gray-400 group-hover:text-green-800" />
                  <span className="text-sm font-medium text-gray-700">{keyword}</span>
                </div>
              ))}
            </>
          )}

          {/* Matching Properties Section */}
          {search.length >= 2 && suggestions.length > 0 && (
            <>
              <div className="px-4 py-2 border-b border-gray-50 mb-1">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Matching Properties</p>
              </div>
              {suggestions.map((item) => (
                (() => {
                  const postId = getPostId(item);
                  return (
                <div 
                  key={postId || item.title}
                  onClick={() => {
                    setShowSuggestions(false);
                    if (onSuggestionClick) {
                      onSuggestionClick(item);
                    } else {
                      if (postId) {
                        navigate(`/posts/${postId}`);
                      }
                    }
                  }}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between group transition-colors"
                >
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                        <img src={item.images?.[0] || "/placeholder.jpg"} className="w-full h-full object-cover" alt="" />
                     </div>
                     <div>
                        <p className="text-sm font-bold text-gray-900 group-hover:text-green-800 transition-colors line-clamp-1">{item.title}</p>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">{item.district}, {item.city}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-xs font-semibold text-green-800">Rs. {item.price?.toLocaleString() || "0"}</p>
                     <p className="text-[9px] text-gray-400 uppercase font-bold">Month</p>
                  </div>
                </div>
                  );
                })()
              ))}
              <div 
                onClick={handleSearchSubmit}
                className="px-4 py-2 mt-1 border-t border-gray-50 bg-gray-50/50 hover:bg-gray-50 text-center cursor-pointer"
              >
                <p className="text-[10px] font-bold text-green-800 uppercase tracking-widest">See all results for \"{search}\"</p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
