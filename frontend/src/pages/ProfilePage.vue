<template>
  <div class="min-h-screen bg-white-smoke font-Montserrat">
    <!-- Navigation Bar -->
    <NavBar />

    <!-- Main Content -->
    <main class="container mx-auto px-6 py-8">
      <!-- Page Title -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-oxford-blue mb-2">My Profile</h1>
        <p class="text-gray">Manage your account information and view your order history</p>
      </div>

      <!-- Tabs Navigation -->
      <div class="max-w-8xl mx-auto mb-8 bg-white-smoke">
        <Tabs v-model:value="activeTab">
          <TabList class="bg-white-smoke">
            <Tab value="profile" class="flex items-center gap-2">
              <i class="pi pi-user"></i>
              <span class="font-semibold">Profile Details</span>
            </Tab>
            <Tab value="orders" class="flex items-center gap-2">
              <i class="pi pi-shopping-cart"></i>
              <span class="font-semibold">Order History</span>
            </Tab>
          </TabList>

          <TabPanels>
            <!-- Profile Details Panel -->
            <TabPanel value="profile">
              <div class="mt-6">
                <ProfileCard />
              </div>
            </TabPanel>

            <!-- Order History Panel -->
            <TabPanel value="orders">
              <div class="mt-6">
                <OrdersTable />
              </div>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </main>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import NavBar from '@/components/NavBar.vue'
import Footer from '@/components/Footer.vue'
import ProfileCard from '@/components/ProfileCard.vue'
import OrdersTable from '@/components/OrdersTable.vue'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'

// Active tab state
const activeTab = ref('profile')
</script>

<style scoped>
/* Custom styling for tabs */
:deep(.p-tabs-tablist) {
  background-color: transparent;
  border-radius: 8px;
  padding: 0.5rem;
}

:deep(.p-tab) {
  color: #777B7E;
  padding: 0.75rem 1.5rem;
  font-family: 'Montserrat', sans-serif;
  transition: all 0.3s ease;
  border-radius: 6px;
}

:deep(.p-tab:hover) {
  background-color: #F1F3F2;
  color: #102540;
}

:deep(.p-tab[data-p-active="true"]) {
  background-color: #102540;
  color: #F3F3F3;
}

:deep(.p-tab[data-p-active="true"]:hover) {
  background-color: #102540;
  color: #F3F3F3;
}

:deep(.p-tabpanels) {
  background-color: transparent;
  padding: 0;
}

.text-oxford-blue {
  color: #102540;
}

.text-gray {
  color: #777B7E;
}

.bg-white-smoke {
  background-color: #F3F3F3;
}
</style>
