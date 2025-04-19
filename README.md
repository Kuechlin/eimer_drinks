# Eimer Drink Tracker - Keep the Rounds Straight! 🍻🤘

[![Deploy to GitHub Pages](https://github.com/<YOUR_USERNAME>/<YOUR_REPOSITORY_NAME>/actions/workflows/deploy.yml/badge.svg)](https://github.com/<YOUR_USERNAME>/<YOUR_REPOSITORY_NAME>/actions/workflows/deploy.yml)

So, you're heading down to the **Eimer** in Freiburg for a night of good music[cite: 2, 3], maybe some Kicker[cite: 3], and definitely a few rounds with your mates? Awesome! But who had what? How many Pils[cite: 130], Hefeweizen[cite: 138], Guinness[cite: 158], or maybe even an Absinthe[cite: 334]? Did someone _really_ order that many Mexikaner[cite: 677]?

Fear not, this little app is here to save your beer-soaked napkin calculations! Built specifically for keeping tabs on who's drinking what at the legendary Eimer Music Pub[cite: 2].

## What's this thing do then? 🤔

- **Friend Zone:** List who's in your drinking crew for the night.
- **Drink Log:** Quickly tap in who grabbed which brew (or shot, or longdrink...) using the actual Eimer drink list[cite: 1].
- **Damage Report:** See a running log of the orders. No more "Did _I_ order that?" arguments.
- **The Reckoning:** Get a summary of drinks per person and the total cost. Settle up without the headache (well, _that_ headache anyway).
- **Dark Mode:** Because staring at a bright screen in the glorious dimness of the Eimer is just wrong. Toggle it on! 🌙
- **It Remembers!** Uses your browser's `localStorage`, so even if you accidentally refresh after that _one_ extra shot, your tab should still be there.

## Features on Tap 🍺

- Add/Select friends joining the session.
- Browse/Search the _actual_ Eimer drink menu (extracted from their site! [cite: 1]).
- Assign drinks to the selected person.
- View a real-time order log.
- Remove mistaken orders (we've all been there).
- See a summary breakdown per person and total cost.
- Light/Dark theme toggle.
- Persistent storage using `localStorage`.
- Responsive design for mobile use (because who brings a laptop to the pub?).
- Deployed automatically via GitHub Actions to GitHub Pages.

## Tech Stack Fueling This Engine 🛠️

- **React** with **Vite** (Keeps things speedy)
- **TypeScript** (To try and keep the bugs out)
- **CSS Modules** (Keeps the styles from fighting each other)
- **GitHub Actions** (For automatic deployment)
- Pure digital elbow grease & possibly some caffeine[cite: 5, 362].

## Get it Running (Locally) 💻

1.  **Clone the repo:**
    ```bash
    git clone [https://github.com/](https://github.com/)<YOUR_USERNAME>/<YOUR_REPOSITORY_NAME>.git
    cd <YOUR_REPOSITORY_NAME>
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or if you prefer yarn:
    # yarn install
    ```
3.  **Fire it up!**
    ```bash
    npm run dev
    # or
    # yarn dev
    ```
4.  Open your browser to the local address provided (usually `http://localhost:5173`).

## Deployment 🚀

This project uses a GitHub Actions workflow (`.github/workflows/deploy.yml`) to automatically build and deploy to GitHub Pages whenever changes are pushed to the `main` branch.

Make sure your `vite.config.ts` has the correct `base` path set!

---

Now, go forth, enjoy the Eimer, and keep track responsibly (or at least, _accurately_)! Prost! 🍻
