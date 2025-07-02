import HomePage from "../pages/home/home-page";
import AboutPage from "../pages/about/about-page";
import MoviesPage from "../pages/movies/movies-page";
import AddMoviePage from "../pages/add-movie/add-movie-page";
import MovieDetailPage from "../pages/movie-detail/movie-detail-page";
import LoginPage from "../pages/auth/login-page";
import RegisterPage from "../pages/auth/register-page";
import FavoritesPage from "../pages/favorites/favorites-page";
import SettingsPage from "../pages/settings/settings-page";
import NotFoundPage from "../pages/not-found/not-found-page";

const routes = {
  "/": new HomePage(),
  "/about": new AboutPage(),
  "/movies": new MoviesPage(),
  "/add-movie": new AddMoviePage(),
  "/movie/:id": new MovieDetailPage(),
  "/login": new LoginPage(),
  "/register": new RegisterPage(),
  "/favorites": new FavoritesPage(),
  "/settings": new SettingsPage(),
  "/404": new NotFoundPage(),
};

export default routes;
