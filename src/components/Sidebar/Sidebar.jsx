import { Drawer } from "@material-ui/core";
import NavContent from "./NavContent.jsx";
import "./sidebar.scss";

function Sidebar() {
  return (
    <div className={`sidebar`} id="sidebarContent" style={{ display: 'none' }}>
      <Drawer variant="permanent" anchor="left">
        <NavContent />
      </Drawer>
    </div>
  );
}

export default Sidebar;
