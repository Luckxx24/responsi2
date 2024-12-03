<template>
    <ion-modal :is-open="isOpen" @did-dismiss="cancel">
        <ion-header>
            <ion-toolbar>
                <ion-title>{{ editingId ? 'Edit' : 'Add' }} Race</ion-title>
                <ion-buttons slot="start">
                    <ion-button @click="cancel"><ion-icon :icon="close"></ion-icon></ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-item>
                <ion-input v-model="race.name" label="Race Name" label-placement="floating"
                    placeholder="Enter Race Name"></ion-input>
            </ion-item>
            <ion-item>
                <ion-textarea v-model="race.description" label="Description" label-placement="floating"
                    placeholder="Enter Description" :autogrow="true" :rows="3"></ion-textarea>
            </ion-item>
            <ion-row>
                <ion-col>
                    <ion-button type="button" @click="input" shape="round" color="primary" expand="block">
                        {{ editingId ? 'Edit' : 'Add' }} Race
                    </ion-button>
                </ion-col>
            </ion-row>
        </ion-content>
    </ion-modal>
</template>

<script setup lang="ts">
import {
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonInput,
    IonRow,
    IonCol,
    IonItem,
    IonContent,
    IonTextarea,
} from '@ionic/vue';
import { close } from 'ionicons/icons';
import { Race } from '@/utils/firestore';

const props = defineProps<{
    isOpen: boolean;
    editingId: string | null;
    race: Omit<Race, 'id' | 'createdAt' | 'updatedAt'>;
}>();

const emit = defineEmits<{
    'update:isOpen': [value: boolean];
    'update:editingId': [value: string | null];
    'submit': [item: Omit<Race, 'id' | 'createdAt' | 'updatedAt'>];
}>();

const cancel = () => {
    emit('update:isOpen', false);
    emit('update:editingId', null);
    props.race.name = '';
    props.race.description = '';
};

const input = () => {
    emit('submit', props.race);
    cancel();
};
</script>
