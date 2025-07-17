import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

// Complex component combining multiple patterns that stress the normalizer
function ComplexComponent(props, ref) {
  const {
    items = [],
    onItemClick,
    renderItem,
    defaultSelected = 0,
    ...restProps
  } = props;
  const [selectedIndex, setSelectedIndex] = useState(defaultSelected);
  const [searchTerm, setSearchTerm] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef(null);
  const timeoutRef = useRef(null);

  // Complex memoized computation
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;

    return items.filter((item, index) => {
      const matchesSearch =
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesIndex = index.toString().includes(searchTerm);
      return matchesSearch || matchesIndex;
    });
  }, [items, searchTerm]);

  // Complex callback with multiple dependencies
  const handleItemSelect = useCallback(
    (item, index, event) => {
      event.preventDefault();

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setSelectedIndex(index);

      // Debounced callback execution
      timeoutRef.current = setTimeout(() => {
        onItemClick?.(item, index, {
          isExpanded,
          searchTerm,
          filteredCount: filteredItems.length,
        });
      }, 200);
    },
    [onItemClick, isExpanded, searchTerm, filteredItems.length],
  );

  // Complex effect with cleanup
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isExpanded) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((prev) =>
            Math.min(prev + 1, filteredItems.length - 1),
          );
          break;
        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          event.preventDefault();
          if (filteredItems[selectedIndex]) {
            handleItemSelect(
              filteredItems[selectedIndex],
              selectedIndex,
              event,
            );
          }
          break;
        case "Escape":
          setIsExpanded(false);
          break;
      }
    };

    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isExpanded, filteredItems, selectedIndex, handleItemSelect]);

  // Imperative handle for ref
  useImperativeHandle(
    ref,
    () => ({
      focus: () => containerRef.current?.focus(),
      collapse: () => setIsExpanded(false),
      expand: () => setIsExpanded(true),
      selectItem: (index) => {
        if (index >= 0 && index < filteredItems.length) {
          setSelectedIndex(index);
        }
      },
      getSelectedItem: () => filteredItems[selectedIndex],
      clearSearch: () => setSearchTerm(""),
    }),
    [filteredItems, selectedIndex],
  );

  // Complex conditional rendering with nested fragments
  const renderContent = () => {
    if (!filteredItems.length) {
      return (
        <>
          <div className="empty-state">
            <span>No items found</span>
            {searchTerm && (
              <button onClick={() => setSearchTerm("")}>Clear search</button>
            )}
          </div>
        </>
      );
    }

    return (
      <>
        {filteredItems.map((item, index) => {
          const isSelected = index === selectedIndex;
          const isCustomRender = typeof renderItem === "function";

          return (
            <React.Fragment key={item.id || index}>
              {isCustomRender ? (
                renderItem(item, index, { isSelected, isExpanded })
              ) : (
                <div
                  className={`item ${isSelected ? "selected" : ""}`}
                  onClick={(e) => handleItemSelect(item, index, e)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  {...(item.testId && { "data-testid": item.testId })}
                >
                  <span className="item-name">{item.name}</span>
                  {item.description && (
                    <span className="item-description">{item.description}</span>
                  )}
                  {item.badge && (
                    <span className={`badge ${item.badge.type || "default"}`}>
                      {item.badge.text}
                    </span>
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </>
    );
  };

  return (
    <div
      ref={containerRef}
      className={`complex-component ${isExpanded ? "expanded" : "collapsed"}`}
      {...restProps}
    >
      <div className="header">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          placeholder="Search items..."
          className="search-input"
        />
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="toggle-button"
          aria-expanded={isExpanded}
        >
          {isExpanded ? "▲" : "▼"}
        </button>
      </div>

      {isExpanded && (
        <div className="content">
          <div className="items-container">{renderContent()}</div>
          <div className="footer">
            <span className="item-count">
              {filteredItems.length} of {items.length} items
            </span>
            {selectedIndex >= 0 && filteredItems[selectedIndex] && (
              <span className="selected-info">
                Selected: {filteredItems[selectedIndex].name}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ComplexComponent;
