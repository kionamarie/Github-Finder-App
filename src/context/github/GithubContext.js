import { createContext, useReducer } from "react";
import githubReducer from "./githubReducer";

const githubContext = createContext();

const GITHUB_URL = process.env.REACT_APP_GITHUB_URL;
const GITHUB_TOKEN = process.env.REACT_APP_GITHUB_TOKEN;

export const GithubProvider = ({ children }) => {
  const initialState = {
    repos: [],
    users: [],
    user: {},
    loading: false,
  };

  const [state, dispatch] = useReducer(githubReducer, initialState);

  // Get search results
  const searchUsers = async (text) => {
    setLoading();

    const params = new URLSearchParams({
      q: text,
    });

    const response = await fetch(`${GITHUB_URL}/search/users?${params}`, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` },
    });

    const { items } = await response.json();

    dispatch({
      type: "GET_USERS",
      payload: items,
    });
  };

  // Get a single user
  const getUser = async (login) => {
    setLoading();

    const response = await fetch(`${GITHUB_URL}/users/${login}`, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` },
    });

    if (response.status === 404) {
      window.location = "/notfound";
    } else {
      const data = await response.json();

      dispatch({
        type: "GET_USER",
        payload: data,
      });
    }
  };

  // Get user repos
  const getUserRepos = async (login) => {
    setLoading();

    const params = new URLSearchParams({
      sort: "created",
      per_page: 10,
    });

    const response = await fetch(
      `${GITHUB_URL}/users/${login}/repos?${params}`,
      {
        headers: { Authorization: `token ${GITHUB_TOKEN}` },
      }
    );

    const data = await response.json();

    dispatch({
      type: "GET_REPOS",
      payload: data,
    });
  };

  // Clear users from state
  const clearUsers = () => dispatch({ type: "CLEAR_USERS" });

  // Set Loading
  const setLoading = () => dispatch({ type: "SET_LOADING" });

  return (
    <githubContext.Provider
      value={{
        users: state.users,
        user: state.user,
        repos: state.repos,
        loading: state.loading,
        searchUsers,
        getUserRepos,
        clearUsers,
        getUser,
      }}
    >
      {children}
    </githubContext.Provider>
  );
};

export default githubContext;
