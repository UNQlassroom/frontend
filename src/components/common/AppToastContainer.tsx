import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const AppToastContainer = () => {
  return (
    <ToastContainer
      position="top-right"
      autoClose={6000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      limit={4}
    />
  );
};
