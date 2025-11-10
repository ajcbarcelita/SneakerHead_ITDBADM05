<template>
    <nav class="bg-oxford-blue text-antiflash-white font-Montserrat">
        <div class="container mx-auto px-6">
            <div class="grid grid-cols-3 items-center py-2">

                <!-- LEFT SIDE: Menu Button -->
                <div class="flex items-center space-x-4">
                    <Button icon="pi pi-bars" class="menu-btn mr-6" @click="drawerVisible = true" />
                    <router-link to="/BMDashboard" class="flex items-center gap-3">
                        <span class="uppercase font-bold text-2xl">Branch Manager Dashboard</span>
                    </router-link>
                </div>

                <!-- CENTER LOGO -->
                <div class="flex justify-center">
                    <router-link to="/BMDashboard" class="flex flex-col items-center">
                        <img src="@/assets/SneakerheadLogo.png" alt="Sneakerhead" class="h-20 w-auto" />
                    </router-link>
                </div>

                <!-- RIGHT SIDE: Profile & Sign Out -->
                <div class="flex items-center justify-end space-x-4">
                    <router-link to="/login" class="nav-link">SIGN OUT</router-link>
                    <router-link to="/profile" class="p-2 rounded-full hover:bg-white/10" aria-label="Profile">
                        <img src="@/assets/Profile.png" alt="Profile" class="h-8 w-8 rounded-full invert" />
                    </router-link>
                </div>
            </div>
        </div>

        <!-- DRAWER / SIDEBAR -->
        <Drawer v-model:visible="drawerVisible" position="left">
            <template #container="{ closeCallback }">
                <div class="flex flex-col h-full bg-antiflash-white text-charcoal">
                    <!-- HEADER -->
                    <div class="flex items-center justify-between p-5 border-b border-gray-200">
                        <h2 class="font-bold text-xl">Branch Dashboard</h2>
                        <Button icon="pi pi-times" text rounded class="close-btn" @click="closeCallback" />
                    </div>

                    <!-- MENU ITEMS -->
                    <div class="overflow-y-auto mt-4">
                        <ul class="list-none p-0 m-0">
                            <li v-for="item in menuItems" :key="item.label">
                                <router-link :to="item.to"
                                    class="flex items-center px-6 py-3 hover:bg-gray-200 transition-colors"
                                    @click="closeCallback">
                                    <i :class="item.icon + ' mr-3 text-giants-orange'"></i>
                                    <span class="font-medium">{{ item.label }}</span>
                                </router-link>
                            </li>
                        </ul>
                    </div>
                </div>
            </template>
        </Drawer>
    </nav>
</template>

<script setup>
import { ref } from "vue";
import Drawer from "primevue/drawer";
import Button from "primevue/button";

const drawerVisible = ref(false);

const menuItems = [
    { label: "Dashboard Overview", icon: "pi pi-home", to: "/BMDashboard" },
    { label: "Manage Stock", icon: "pi pi-box", to: "/ManageStock" },
    { label: "View Orders", icon: "pi pi-shopping-cart", to: "/ManageOrders" },
];
</script>

<style scoped>
nav {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
