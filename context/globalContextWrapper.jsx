import { useRef, useState } from "react";
import GlobalContext from ".";
import Modal from "../components/modal/modal";

// this component wraps the site's global context. Used e.g. for guarantee that the global modal is always on the top of the site layout
const GlobalContextWrapper = ({ children, data }) => {
  const [globalModalTrigger, setGlobalModalTrigger] = useState(false);
  const [globalModalContent, setGlobalModalContent] = useState(null);

  // UJET shop formData object
  const [formData, setFormData] = useState({});

  const handleSetGlobalModal = (content) => {
    setGlobalModalTrigger(!globalModalTrigger);
    setGlobalModalContent(content);
  };

  const updateFormData = (newData) => {
    setFormData({ ...formData, ...newData });
  };

  const resetData = () => {
    setFormData({});
  };

  const context = {
    globalModalTrigger,
    formData,
    handleSetGlobalModal,
    globalSettings: data,
    navbarRef: useRef(),
    updateFormData,
    resetData,
  };
  return (
    <GlobalContext.Provider value={context}>
      {children}
      <Modal
        trigger={globalModalTrigger}
        closeCallback={() => {
          setGlobalModalContent(null);
        }}
      >
        {globalModalContent}
      </Modal>
    </GlobalContext.Provider>
  );
};
export default GlobalContextWrapper;
