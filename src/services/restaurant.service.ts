import {
  getRestaurantDetails,
  getAllRestaurants,
} from './restaurant/restaurantRead';
import {
  updateRestaurantInfo,
  createRestaurant,
  updateRestaurantBranding,
  setRestaurantActive,
  deleteRestaurant,
} from './restaurant/restaurantWrite';

export const restaurantService = {
  getRestaurantDetails,
  updateRestaurantInfo,
  getAllRestaurants,
  createRestaurant,
  updateRestaurantBranding,
  setRestaurantActive,
  deleteRestaurant,
};
