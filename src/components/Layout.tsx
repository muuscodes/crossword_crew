import Navbar from "./Navbar";
import Footer from "./Footer";
import Modal from "./Modal";
import Authentication from "./Authentication";
import { useState } from "react";

export default function Layout(props: any) {
  const { children } = props;
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
      <Navbar setShowModal={setShowModal} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
