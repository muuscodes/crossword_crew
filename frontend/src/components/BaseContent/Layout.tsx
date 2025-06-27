import Navbar from "./Navbar";
import Footer from "./Footer";
import Modal from "../NonAuthContent/Modal";
import Authentication from "../NonAuthContent/Authentication";
import { useState, useEffect } from "react";
import type { LayoutProps } from "../utils/types";

export default function Layout(props: LayoutProps) {
  const { children, isAuthenticated } = props;
  const [showModal, setShowModal] = useState<boolean>(false);

  const handleCloseModal = () => {
    setShowModal(false);
  };

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showModal]);
  return (
    <>
      {showModal && (
        <Modal handleCloseModal={handleCloseModal}>
          <Authentication handleCloseModal={handleCloseModal}></Authentication>
        </Modal>
      )}
      <Navbar setShowModal={setShowModal} isAuthenticated={isAuthenticated} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
