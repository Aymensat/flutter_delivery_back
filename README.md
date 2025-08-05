# Backend for Flutter Food Delivery App

This is the backend for a food delivery application, built with Node.js, Express, and MongoDB. It provides a RESTful API for managing users, restaurants, food items, orders, and deliveries.

## OpenAPI Specification

The OpenAPI v4 specification for this API is available in the `openapi-v4.yaml` file. This file provides a detailed description of all the available endpoints, their parameters, and the expected responses. It can be used to generate client libraries, documentation, and for testing purposes.

## Application Workflow

The application follows a standard food delivery workflow:

1.  **User Management:**
    *   Users can register, log in, and manage their profiles.
    *   Authentication is handled using JSON Web Tokens (JWT).
    *   User roles (e.g., customer, restaurant owner, delivery driver) are used to control access to different parts of the application.

2.  **Restaurant Management:**
    *   Restaurants can be created, updated, and deleted.
    *   Each restaurant has a menu of food items.
    *   Restaurant owners can manage their restaurant's information, including its name, address, and opening hours.

3.  **Food Management:**
    *   Food items can be added, updated, and deleted from a restaurant's menu.
    *   Each food item has a name, description, price, and image.

4.  **Ordering:**
    *   Customers can browse restaurants and their menus.
    *   They can add food items to their cart and place an order.
    *   The order is then sent to the restaurant for preparation.

5.  **Delivery:**
    *   Once an order is ready, a delivery driver is assigned to pick it up.
    *   The driver can then deliver the order to the customer's address.
    *   The customer can track the status of their order in real-time.

6.  **Payment:**
    *   Payments are handled through a third-party payment gateway.
    *   Customers can pay for their orders using a variety of payment methods.

7.  **Real-time Updates:**
    *   WebSockets are used to provide real-time updates to the client.
    *   For example, the customer is notified when their order is confirmed, picked up, and delivered.

## Geocoding and Mapping

The application uses the OpenStreetMap Nominatim service for geocoding and reverse geocoding. This allows the application to:

*   Convert addresses to geographic coordinates (latitude and longitude).
*   Convert geographic coordinates to human-readable addresses.
*   Display maps and routes to the user.

## File Uploads

The application uses `multer` to handle file uploads. This allows users to upload images for their profile pictures, restaurant logos, and food items.

## Getting Started

To get started with the application, you will need to have Node.js and MongoDB installed on your machine.

1.  Clone the repository:

```
git clone https://github.com/your-username/backend-flutter-app.git
```

2.  Install the dependencies:

```
npm install
```

3.  Create a `.env` file in the root of the project and add the following environment variables:

```
MONGO_URI=<your-mongodb-uri>
JWT_SECRET=<your-jwt-secret>
```

4.  Start the server:

```
npm start
```

The server will be running on `http://localhost:3000`.
