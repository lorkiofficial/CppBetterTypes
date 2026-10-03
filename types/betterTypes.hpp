#pragma once

#include <cstdint>
#include <string>
#include <string_view>
#include <unordered_map>
#include <unordered_set>


// Integral types
using int8  = std::int8_t;
using int16 = std::int16_t;
using int32 = std::int32_t;
using int64 = std::int64_t;

using uint8  = std::uint8_t;
using uint16 = std::uint16_t;
using uint32 = std::uint32_t;
using uint64 = std::uint64_t;

using intptr = std::intptr_t;
using uintptr = std::uintptr_t;
using usize = size_t;

// Logical Types
using boolean = uint8;

// Strings
using str = std::string;
using wstr = std::wstring;
using strView = std::string_view;
using wstrView = std::wstring_view;

// Symbol
using wchar = wchar_t;

// Data Structures
using unorderedMap = std::unordered_map;

template<typename Key, typename Value>
using unorderedSet = std::unordered_set<Key, Value>;

// Offsets
using offset32 = uint32;
using offset64 = uint64;

// Layout
using byte = uint8;
using pad = uint8;
using reserved = uint8;
using unknown = uint8;