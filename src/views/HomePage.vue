<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Radiator Springs Speedway</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-refresher slot="fixed" :pull-factor="0.5" :pull-min="100" :pull-max="200" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div class="scrollable-container">
        <ion-list>
          <ion-item-sliding v-for="race in races" :key="race.id">
            <ion-item-options side="start" @ionSwipe="handleDelete(race)">
              <ion-item-option color="danger" expandable @click="handleDelete(race)">
                <ion-icon slot="icon-only" :icon="trash" size="large"></ion-icon>
              </ion-item-option>
            </ion-item-options>

            <ion-item>
              <ion-card class="race-card">
                <ion-card-header>
                  <ion-card-title class="ion-text-wrap limited-text">{{ race.name }}</ion-card-title>
                  <ion-card-subtitle class="limited-text">{{ race.description }}</ion-card-subtitle>
                </ion-card-header>
                <ion-card-content>
                  <ion-badge color="secondary">Last updated: {{ getRelativeTime(race.updatedAt) }}</ion-badge>
                  <ion-badge color="tertiary" class="ion-margin-start" v-if="race.track">
                    Track: {{ race.track }}
                  </ion-badge>
                  <ion-badge color="primary" class="ion-margin-start" v-if="race.schedule">
                    {{ race.schedule }}
                  </ion-badge>
                </ion-card-content>
              </ion-card>
            </ion-item>

            <ion-item-options side="end" @ionSwipe="handleEdit(race)">
              <ion-item-option color="primary" @click="handleEdit(race)">
                <ion-icon slot="icon-only" :icon="create" size="large"></ion-icon>
              </ion-item-option>
            </ion-item-options>
          </ion-item-sliding>
        </ion-list>
        <ion-item v-if="races.length === 0" class="ion-text-center">
          <ion-label>Tidak ada Balapan</ion-label>
        </ion-item>
      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="openModal()" color="secondary">
          <ion-icon :icon="add" size="large"></ion-icon>
        </ion-fab-button>
      </ion-fab>

      <ion-modal :is-open="isOpen" @didDismiss="isOpen = false">
        <ion-header>
          <ion-toolbar>
            <ion-title>{{ editingId ? 'Edit Race' : 'Add New Race' }}</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="isOpen = false">Close</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-item>
            <ion-label position="stacked">Race Name</ion-label>
            <ion-input v-model="race.name" placeholder="Enter race name"></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Description</ion-label>
            <ion-textarea 
              v-model="race.description" 
              placeholder="Enter race description"
              :rows="3"
            ></ion-textarea>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Track</ion-label>
            <ion-input v-model="race.track" placeholder="Enter track name"></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Schedule</ion-label>
            <ion-input v-model="race.schedule" placeholder="Enter race schedule"></ion-input>
          </ion-item>

          <ion-button 
            expand="block"
            class="ion-margin-top"
            @click="submitForm"
          >
            {{ editingId ? 'Update Race' : 'Add Race' }}
          </ion-button>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonBadge,
  IonIcon,
  IonFab,
  IonFabButton,
  IonRefresher,
  IonRefresherContent,
  IonModal,
  IonButton,
  IonButtons,
  IonInput,
  IonTextarea,
  IonLabel,
  toastController,
} from '@ionic/vue';
import { add, create, trash, checkmarkCircle, closeCircle } from 'ionicons/icons';
import { onMounted, ref } from 'vue';
import { firestoreService } from '@/utils/firestore';
import { formatDistanceToNow } from 'date-fns';

interface Race {
  id?: string;
  name: string;
  description: string;
  track?: string;
  schedule?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const isOpen = ref(false);
const editingId = ref<string | null>(null);
const races = ref<Race[]>([]);
const race = ref<Omit<Race, 'id' | 'createdAt' | 'updatedAt'>>({
  name: '',
  description: '',
  track: '',
  schedule: '',
});

const resetForm = () => {
  race.value = {
    name: '',
    description: '',
    track: '',
    schedule: '',
  };
  editingId.value = null;
};

const openModal = () => {
  resetForm();
  isOpen.value = true;
};

const showToast = async (message: string, color: string = 'success', icon: string = checkmarkCircle) => {
  const toast = await toastController.create({
    message,
    duration: 3000,
    color,
    position: 'top',
    icon,
  });
  await toast.present();
};

const getRelativeTime = (date: any) => {
  try {
    const jsDate = date?.toDate ? date.toDate() : new Date(date);
    return formatDistanceToNow(jsDate, { addSuffix: true });
  } catch (error) {
    return 'Time unknown';
  }
};

const loadRaces = async () => {
  try {
    races.value = await firestoreService.getRaces();
  } catch (error) {
    console.error(error);
    showToast('Failed to load races', 'danger', closeCircle);
  }
};

const submitForm = async () => {
  if (!race.value.name) {
    await showToast('Race name is required!', 'warning', closeCircle);
    return;
  }
  try {
    if (editingId.value) {
      await firestoreService.updateRace(editingId.value, race.value as Race);
      await showToast('Race details successfully updated!');
    } else {
      await firestoreService.addRace(race.value as Race);
      await showToast('New race added to the schedule!');
    }
    isOpen.value = false;
    resetForm();
    loadRaces();
  } catch (error) {
    console.error(error);
    showToast('Operation failed', 'danger', closeCircle);
  }
};

const handleEdit = async (editRace: Race) => {
  editingId.value = editRace.id!;
  race.value = {
    name: editRace.name,
    description: editRace.description,
    track: editRace.track || '',
    schedule: editRace.schedule || '',
  };
  isOpen.value = true;
};

const handleDelete = async (deleteRace: Race) => {
  try {
    await firestoreService.deleteRace(deleteRace.id!);
    await showToast('Race removed from schedule');
    loadRaces();
  } catch (error) {
    console.error(error);
    showToast('Failed to delete race', 'danger', closeCircle);
  }
};

const handleRefresh = (event: CustomEvent) => {
  setTimeout(() => {
    loadRaces();
    event.target.complete();
  }, 1000);
};

onMounted(() => {
  loadRaces();
});
</script>

<style scoped>
.race-card {
  width: 100%;
  margin: 8px 0;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.limited-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

ion-toolbar {
  --background: #d35400;
  --color: white;
}

ion-fab-button {
  --background: #e67e22;
}

ion-badge {
  margin-right: 8px;
  padding: 8px;
}
</style>