# Bite - Choice

A React + Vite web application that helps users decide where to eat by finding nearby restaurants and using a spinning wheel to make the final choice. Filters allow users to narrow results by service style, price, and distance.

**Live Demo (AWS + CloudFront)**  
bite-choice.com

---

## Features

- Location-based restaurant search using the Google Places API
- Spin-the-wheel decision system
- Filters for service style, price, and search radius
- Fast frontend built with React and Vite
- Secure production setup using HTTPS and restricted API keys

---

## Tech Stack

### Frontend
- React
- Vite
- JavaScript (ES6+)
- CSS

### APIs
- Google Places API

### Deployment / Infrastructure
- AWS S3 (static website hosting)
- AWS CloudFront (CDN and HTTPS)
- Route 53 (Domain routing)
- GitHub (version control)

---

## How It Works

1. The app requests the user’s location (HTTPS required).
2. Nearby restaurants are fetched using the Google Places API.
3. Results are filtered based on selected options.
4. Remaining restaurants are loaded into a spinning wheel.
5. The wheel is spun to randomly select a restaurant.

---

## Local Development

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Setup

```bash
git clone https://github.com/Cluna-18/where-we-eating.git
cd where-we-eating
npm install
