import Navbar from "./Navbar";
import Footer from "./Footer";
import Modal from "../NonAuthContent/Modal";
import Authentication from "../NonAuthContent/Authentication";
import { useState } from "react";

export default function Layout(props: any) {
  const { children, isAuthenticated } = props;
  const [showModal, setShowModal] = useState<boolean>(false);

  const handleCloseModal = () => {
    setShowModal(false);
  };
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
