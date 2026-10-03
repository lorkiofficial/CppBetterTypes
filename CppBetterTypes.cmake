set(CPP_CORE_TYPES
    "${CMAKE_CURRENT_LIST_DIR}/types/betterTypes.hpp"
)

if(MSVC)
    add_compile_options(
        "/FI${CPP_CORE_TYPES}"
    )
else()
    add_compile_options(
        "-include${CPP_CORE_TYPES}"
    )
endif()