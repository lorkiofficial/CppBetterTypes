# Cpp Better Types

**Better names for C++ types.**

Cpp Better Types is a small C++ type library and VS Code extension focused on simple, explicit types for fixed-width integers, binary layouts, offsets, and low-level data structures.

Instead of:

```cpp
std::uint8_t
std::uint32_t
std::uint64_t
std::size_t
std::intptr_t
```

you can write:

```cpp
uint8
uint32
uint64
usize
intptr
```

## Features

* Simple fixed-width integer types
* Pointer-sized integer types
* String and string-view aliases
* Explicit `boolean` type backed by `uint8`
* `byte` type
* `offset32` and `offset64`
* `pad`, `reserved`, and `unknown` types
* VS Code syntax highlighting
* CMake project integration
* Project-local installation

## Types

### Integer types

```cpp
using int8  = std::int8_t;
using int16 = std::int16_t;
using int32 = std::int32_t;
using int64 = std::int64_t;

using uint8  = std::uint8_t;
using uint16 = std::uint16_t;
using uint32 = std::uint32_t;
using uint64 = std::uint64_t;
```

### Pointer-sized types

```cpp
using intptr  = std::intptr_t;
using uintptr = std::uintptr_t;
using usize   = size_t;
```

### Strings

```cpp
using str      = std::string;
using wstr     = std::wstring;
using strView  = std::string_view;
using wstrView = std::wstring_view;

using wchar = wchar_t;
```

### Binary layout types

```cpp
using boolean = uint8;

using offset32 = uint32;
using offset64 = uint64;

using byte     = uint8;
using pad      = uint8;
using reserved = uint8;
using unknown  = uint8;
```

These types are intentionally simple. They describe the underlying representation directly and are especially useful when working with binary layouts, serialized data, memory structures, and low-level C++ code.

## Example

```cpp
struct Player
{
    uint32 id;
    int32 health;
    boolean enabled;
    offset64 address;
};
```

The resulting structure is explicit about the size and representation of its fields.

## Installation

Install **Cpp Better Types** from the VS Code Marketplace.

After installation, run:

```text
Cpp Better Types: Connect to Project
```

The extension creates a local `.cppbettertypes` directory in the project containing the required C++ types and CMake integration.

The project then becomes independent of the extension's installation location.

## CMake integration

The extension adds:

```cmake
include(.cppbettertypes/CppBetterTypes.cmake)
```

to the project's `CMakeLists.txt`.

The integration uses the project-local copy of the type definitions.

## Forced include

Cpp Better Types is designed to work without manually including the header in every source file.

For GCC and Clang, use:

```text
-include path/to/types/coreTypes.hpp
```

For MSVC:

```text
/FI"path\to\types\coreTypes.hpp"
```

The exact compiler configuration depends on your project and build system.

## Why?

C++ already provides fixed-width integer types through `<cstdint>`, but their names are unnecessarily noisy for code where the exact representation is already obvious:

```cpp
std::uint32_t
```

becomes:

```cpp
uint32
```

The goal is not to replace the C++ standard library.

The goal is to provide a small, consistent vocabulary for code where type size and binary representation matter.


## Build

The extension can be packaged into a VSIX file using `vsce`.

First, install `vsce` globally:

```bash
npm install -g @vscode/vsce
```

Then run:

```bash
npm run build
```

The build script reads the version from `package.json` and creates:

```text
build/CppBetterTypes-<version>.vsix
```

The `build/` directory is intended for generated files and should not be committed to the repository.
