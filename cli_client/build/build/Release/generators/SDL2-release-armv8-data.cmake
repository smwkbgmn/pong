########### AGGREGATED COMPONENTS AND DEPENDENCIES FOR THE MULTI CONFIG #####################
#############################################################################################

list(APPEND sdl_COMPONENT_NAMES SDL2::SDL2 SDL2::SDL2main)
list(REMOVE_DUPLICATES sdl_COMPONENT_NAMES)
if(DEFINED sdl_FIND_DEPENDENCY_NAMES)
  list(APPEND sdl_FIND_DEPENDENCY_NAMES )
  list(REMOVE_DUPLICATES sdl_FIND_DEPENDENCY_NAMES)
else()
  set(sdl_FIND_DEPENDENCY_NAMES )
endif()

########### VARIABLES #######################################################################
#############################################################################################
set(sdl_PACKAGE_FOLDER_RELEASE "/Users/donghyun/.conan2/p/b/sdl8cf422fa5d742/p")
set(sdl_BUILD_MODULES_PATHS_RELEASE )


set(sdl_INCLUDE_DIRS_RELEASE "${sdl_PACKAGE_FOLDER_RELEASE}/include"
			"${sdl_PACKAGE_FOLDER_RELEASE}/include/SDL2")
set(sdl_RES_DIRS_RELEASE )
set(sdl_DEFINITIONS_RELEASE )
set(sdl_SHARED_LINK_FLAGS_RELEASE "-Wl,-weak_framework,CoreHaptics")
set(sdl_EXE_LINK_FLAGS_RELEASE "-Wl,-weak_framework,CoreHaptics")
set(sdl_OBJECTS_RELEASE )
set(sdl_COMPILE_DEFINITIONS_RELEASE )
set(sdl_COMPILE_OPTIONS_C_RELEASE )
set(sdl_COMPILE_OPTIONS_CXX_RELEASE )
set(sdl_LIB_DIRS_RELEASE "${sdl_PACKAGE_FOLDER_RELEASE}/lib")
set(sdl_BIN_DIRS_RELEASE )
set(sdl_LIBRARY_TYPE_RELEASE STATIC)
set(sdl_IS_HOST_WINDOWS_RELEASE 0)
set(sdl_LIBS_RELEASE SDL2main SDL2)
set(sdl_SYSTEM_LIBS_RELEASE )
set(sdl_FRAMEWORK_DIRS_RELEASE )
set(sdl_FRAMEWORKS_RELEASE CoreVideo CoreAudio AudioToolbox AVFoundation Foundation QuartzCore Cocoa Carbon IOKit ForceFeedback GameController Metal)
set(sdl_BUILD_DIRS_RELEASE )
set(sdl_NO_SONAME_MODE_RELEASE FALSE)


# COMPOUND VARIABLES
set(sdl_COMPILE_OPTIONS_RELEASE
    "$<$<COMPILE_LANGUAGE:CXX>:${sdl_COMPILE_OPTIONS_CXX_RELEASE}>"
    "$<$<COMPILE_LANGUAGE:C>:${sdl_COMPILE_OPTIONS_C_RELEASE}>")
set(sdl_LINKER_FLAGS_RELEASE
    "$<$<STREQUAL:$<TARGET_PROPERTY:TYPE>,SHARED_LIBRARY>:${sdl_SHARED_LINK_FLAGS_RELEASE}>"
    "$<$<STREQUAL:$<TARGET_PROPERTY:TYPE>,MODULE_LIBRARY>:${sdl_SHARED_LINK_FLAGS_RELEASE}>"
    "$<$<STREQUAL:$<TARGET_PROPERTY:TYPE>,EXECUTABLE>:${sdl_EXE_LINK_FLAGS_RELEASE}>")


set(sdl_COMPONENTS_RELEASE SDL2::SDL2 SDL2::SDL2main)
########### COMPONENT SDL2::SDL2main VARIABLES ############################################

set(sdl_SDL2_SDL2main_INCLUDE_DIRS_RELEASE "${sdl_PACKAGE_FOLDER_RELEASE}/include")
set(sdl_SDL2_SDL2main_LIB_DIRS_RELEASE "${sdl_PACKAGE_FOLDER_RELEASE}/lib")
set(sdl_SDL2_SDL2main_BIN_DIRS_RELEASE )
set(sdl_SDL2_SDL2main_LIBRARY_TYPE_RELEASE STATIC)
set(sdl_SDL2_SDL2main_IS_HOST_WINDOWS_RELEASE 0)
set(sdl_SDL2_SDL2main_RES_DIRS_RELEASE )
set(sdl_SDL2_SDL2main_DEFINITIONS_RELEASE )
set(sdl_SDL2_SDL2main_OBJECTS_RELEASE )
set(sdl_SDL2_SDL2main_COMPILE_DEFINITIONS_RELEASE )
set(sdl_SDL2_SDL2main_COMPILE_OPTIONS_C_RELEASE "")
set(sdl_SDL2_SDL2main_COMPILE_OPTIONS_CXX_RELEASE "")
set(sdl_SDL2_SDL2main_LIBS_RELEASE SDL2main)
set(sdl_SDL2_SDL2main_SYSTEM_LIBS_RELEASE )
set(sdl_SDL2_SDL2main_FRAMEWORK_DIRS_RELEASE )
set(sdl_SDL2_SDL2main_FRAMEWORKS_RELEASE )
set(sdl_SDL2_SDL2main_DEPENDENCIES_RELEASE SDL2::SDL2)
set(sdl_SDL2_SDL2main_SHARED_LINK_FLAGS_RELEASE )
set(sdl_SDL2_SDL2main_EXE_LINK_FLAGS_RELEASE )
set(sdl_SDL2_SDL2main_NO_SONAME_MODE_RELEASE FALSE)

# COMPOUND VARIABLES
set(sdl_SDL2_SDL2main_LINKER_FLAGS_RELEASE
        $<$<STREQUAL:$<TARGET_PROPERTY:TYPE>,SHARED_LIBRARY>:${sdl_SDL2_SDL2main_SHARED_LINK_FLAGS_RELEASE}>
        $<$<STREQUAL:$<TARGET_PROPERTY:TYPE>,MODULE_LIBRARY>:${sdl_SDL2_SDL2main_SHARED_LINK_FLAGS_RELEASE}>
        $<$<STREQUAL:$<TARGET_PROPERTY:TYPE>,EXECUTABLE>:${sdl_SDL2_SDL2main_EXE_LINK_FLAGS_RELEASE}>
)
set(sdl_SDL2_SDL2main_COMPILE_OPTIONS_RELEASE
    "$<$<COMPILE_LANGUAGE:CXX>:${sdl_SDL2_SDL2main_COMPILE_OPTIONS_CXX_RELEASE}>"
    "$<$<COMPILE_LANGUAGE:C>:${sdl_SDL2_SDL2main_COMPILE_OPTIONS_C_RELEASE}>")
########### COMPONENT SDL2::SDL2 VARIABLES ############################################

set(sdl_SDL2_SDL2_INCLUDE_DIRS_RELEASE "${sdl_PACKAGE_FOLDER_RELEASE}/include"
			"${sdl_PACKAGE_FOLDER_RELEASE}/include/SDL2")
set(sdl_SDL2_SDL2_LIB_DIRS_RELEASE "${sdl_PACKAGE_FOLDER_RELEASE}/lib")
set(sdl_SDL2_SDL2_BIN_DIRS_RELEASE )
set(sdl_SDL2_SDL2_LIBRARY_TYPE_RELEASE STATIC)
set(sdl_SDL2_SDL2_IS_HOST_WINDOWS_RELEASE 0)
set(sdl_SDL2_SDL2_RES_DIRS_RELEASE )
set(sdl_SDL2_SDL2_DEFINITIONS_RELEASE )
set(sdl_SDL2_SDL2_OBJECTS_RELEASE )
set(sdl_SDL2_SDL2_COMPILE_DEFINITIONS_RELEASE )
set(sdl_SDL2_SDL2_COMPILE_OPTIONS_C_RELEASE "")
set(sdl_SDL2_SDL2_COMPILE_OPTIONS_CXX_RELEASE "")
set(sdl_SDL2_SDL2_LIBS_RELEASE SDL2)
set(sdl_SDL2_SDL2_SYSTEM_LIBS_RELEASE )
set(sdl_SDL2_SDL2_FRAMEWORK_DIRS_RELEASE )
set(sdl_SDL2_SDL2_FRAMEWORKS_RELEASE CoreVideo CoreAudio AudioToolbox AVFoundation Foundation QuartzCore Cocoa Carbon IOKit ForceFeedback GameController Metal)
set(sdl_SDL2_SDL2_DEPENDENCIES_RELEASE )
set(sdl_SDL2_SDL2_SHARED_LINK_FLAGS_RELEASE "-Wl,-weak_framework,CoreHaptics")
set(sdl_SDL2_SDL2_EXE_LINK_FLAGS_RELEASE "-Wl,-weak_framework,CoreHaptics")
set(sdl_SDL2_SDL2_NO_SONAME_MODE_RELEASE FALSE)

# COMPOUND VARIABLES
set(sdl_SDL2_SDL2_LINKER_FLAGS_RELEASE
        $<$<STREQUAL:$<TARGET_PROPERTY:TYPE>,SHARED_LIBRARY>:${sdl_SDL2_SDL2_SHARED_LINK_FLAGS_RELEASE}>
        $<$<STREQUAL:$<TARGET_PROPERTY:TYPE>,MODULE_LIBRARY>:${sdl_SDL2_SDL2_SHARED_LINK_FLAGS_RELEASE}>
        $<$<STREQUAL:$<TARGET_PROPERTY:TYPE>,EXECUTABLE>:${sdl_SDL2_SDL2_EXE_LINK_FLAGS_RELEASE}>
)
set(sdl_SDL2_SDL2_COMPILE_OPTIONS_RELEASE
    "$<$<COMPILE_LANGUAGE:CXX>:${sdl_SDL2_SDL2_COMPILE_OPTIONS_CXX_RELEASE}>"
    "$<$<COMPILE_LANGUAGE:C>:${sdl_SDL2_SDL2_COMPILE_OPTIONS_C_RELEASE}>")