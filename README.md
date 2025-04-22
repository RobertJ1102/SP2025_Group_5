# Farefinder — SP2025 Group 5

**Farefinder** helps users discover the most affordable Uber pickup points during periods of surge pricing, such as around large group events. Whether you're attending a concert, traveling from the airport, or simply trying to save a few dollars on your next ride, Farefinder finds nearby pickup alternatives that are cheaper—so you don't have to overpay.

---

## Team Members

- **Robert Jacobs**  
  _Email:_ robert.jacobs@wustl.edu  
  _GitHub:_ [RobertJ1102](https://github.com/RobertJ1102)

- **Albert Tang**  
  _Email:_ albert.t@wustl.edu  
  _GitHub:_ [albear007](https://github.com/albear007)

- **Eric Liu**  
  _Email:_ e.m.liu@wustl.edu  
  _GitHub:_ [EricWashu](https://github.com/EricWashu)

**TA:** Asher

---

## Objectives

Farefinder addresses the problem of overpriced Uber fares during high-demand periods by suggesting nearby, lower-cost pickup alternatives. While designed to help users avoid surge pricing near large events, it is equally useful for finding affordable rides at any time.

> _"Why walk into surge pricing when cheaper options are just around the corner?"_

The application utilizes a geospatial search algorithm to suggest nearby cheaper locations within a configurable walking distance. Though integration with the official Uber API is still in progress, a mocked API is currently used for development and testing.

---

## Our Tech Stack

- **Frontend:** React, Material UI, Google Maps API
- **Backend:** FastAPI
- **Database** MySql
- **Geolocation Services:** Google Maps Geocoding & Places APIs
- **Deployment:** Docker + Google Cloud + Kubernetes
- **Mocked API:** Simulates Uber price estimates based on distance and time factors

---

## How to Run

### Live Version

The production version is deployed and available at:

🔗 [https://farefinder.syntale.net](https://farefinder.syntale.net)

---

### Local Development (Docker)

1. **Clone the repository**

   ```bash
   git clone https://github.com/RobertJ1102/SP2025_Group_5.git
   cd SP2025_Group_5
   ```

2. **Start the app with Docker Compose**

   ```bash
   docker-compose up --build
   ```

3. **Visit in your browser**
   ```
   http://localhost:3000
   ```

---

## Contact

Feel free to reach out to any of the team members above for questions, contributions, or ideas.
