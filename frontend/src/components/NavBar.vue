<template>
    <nav class="bg-oxford-blue text-antiflash-white font-Montserrat">
        <div class="container mx-auto px-6">
            <div class="grid grid-cols-3 items-center py-2">
                <!-- Home & Products -->
                <div class="flex items-center">
                    <div class="space-x-6 uppercase text-lg">
                        <router-link to="/" class="nav-link">Home</router-link>
                        <router-link to="/products" class="nav-link">Sneaker Catalog</router-link>
                    </div>
                </div>

                <!-- Center Logo -->
                <div class="flex justify-center">
                    <router-link to="/" class="flex flex-col items-center">
                        <img src="@/assets/SneakerheadLogo.png" alt="Sneakerhead" class="h-24 w-auto" />
                    </router-link>
                </div>

                <!-- Right Side -->
                <div class="flex items-center justify-end space-x-4 text-base">
                    <!-- Cart Page -->
                    <router-link to="/cart"
                        class="flex items-center gap-2 px-3 py-1 rounded-md bg-giants-orange text-white font-bold hover:opacity-90">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                d="M3 3h2l.4 2M7 13h10l3-8H6.4" />
                            <circle cx="9" cy="20" r="1" />
                            <circle cx="19" cy="20" r="1" />
                        </svg>
                        <span>CART</span>
                    </router-link>

                    <!-- Sign-in / Register -->
                    <router-link to="/login" class="nav-link">SIGN IN</router-link>

                    <!-- Edit Profile -->
                    <router-link to="/profile" class="p-2 rounded-full hover:bg-white/10" aria-label="Profile">
                        <img src="@/assets/Profile.png" alt="Profile" class="h-8 w-8 rounded-full invert" />
                    </router-link>
                </div>
            </div>
        </div>
    </nav>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({});
</script>
