# Gessinvest – application mobile (Expo / React Native)

Même backend Supabase que le site web (tables `members`, `cotisations`, `projets_membres`).

## Lancer
    cd mobile && npm install && npx expo install --fix
    npx expo start

## Publier sur le Play Store
1. `npm i -g eas-cli && eas login && eas init` (compte Expo)
2. `eas build -p android --profile production` (génère le .aab et la clé de signature)
3. Créer l'app dans la Play Console, puis la fiche (`store/listing-fr.md`) et la politique de confidentialité.
4. Compte de service Google Cloud -> clé JSON enregistrée en `google-service-account.json` (ignorée par git)
5. `eas submit -p android --profile production` (piste interne), puis test fermé (12 testeurs / 14 jours), puis production.
