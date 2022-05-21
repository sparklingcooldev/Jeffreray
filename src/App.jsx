import { ThemeProvider } from "@material-ui/core/styles";
import { useEffect, useState, useCallback, useMemo } from "react";
import { BrowserRouter as Router, Route, Redirect, Switch, useLocation, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Hidden, useMediaQuery } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import useTheme from "./hooks/useTheme";
import { useAddress, useWeb3Context } from "./hooks/web3Context";
import useGoogleAnalytics from "./hooks/useGoogleAnalytics";
import useSegmentAnalytics from "./hooks/useSegmentAnalytics";
import { storeQueryParameters } from "./helpers/QueryParameterHelper";

import { Home, Stake, ChooseBond, Bond, Dashboard, TreasuryDashboard, Presale, Swap } from "./views";
import Sidebar from "./components/Sidebar/Sidebar.jsx";
import TopBar from "./components/TopBar/TopBar.jsx";
import NavDrawer from "./components/Sidebar/NavDrawer.jsx";
import Messages from "./components/Messages/Messages";

import { dark as darkTheme } from "./themes/dark.js";
import { ethers } from "ethers";
import axios from "axios";

import "./style.scss";
import { DOX_ADDR, DOX_LOCK, DOX_UNLOCK, DOX_BNB_PAIR, DOX_DIVIDEND_ADDR } from './abi/address.js'
import DoxTokenABI from './abi/DoxToken.json'

import UnLockABI from './abi/UnLockABI.json'
import LockABI from './abi/LockABI.json'

import PancakePairABI from './abi/PancakePairABI.json';
import DoxDividendTracker from './abi/DoxDividendTracker.json';
import Pool from "./views/Pool";

// 😬 Sorry for all the console logging
const DEBUG = false;

// 🛰 providers
if (DEBUG) console.log("📡 Connecting to Mainnet Ethereum");
// 🔭 block explorer URL
// const blockExplorer = targetNetwork.blockExplorer;

const drawerWidth = 0;
const transitionDuration = 969;

const useStyles = makeStyles(theme => ({
  drawer: {
    [theme.breakpoints.up("md")]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(1),
    paddingTop: '40px',
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: transitionDuration,
    }),
    height: "100%",
    overflow: "auto",
    background: "#202020",
    backgroundSize: "cover",
    marginLeft: drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: transitionDuration,
    }),
    marginLeft: 0,
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: drawerWidth,
  },
}));

let rewardflag = null, poolflag = null;

function App() {
  useGoogleAnalytics();
  useSegmentAnalytics();
  const dispatch = useDispatch();
  const [theme, toggleTheme, mounted] = useTheme();
  const location = useLocation();
  const classes = useStyles();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isSmallerScreen = useMediaQuery("(max-width: 980px)");
  const isSmallScreen = useMediaQuery("(max-width: 600px)");

  const history = useHistory();
  const { connect, hasCachedProvider, provider, chainID, connected } = useWeb3Context();
  const address = useAddress();

  const [walletChecked, setWalletChecked] = useState(false);

  const [tokeninfo, setTokenInfo] = useState({ name: 'DOXED', symbol: 'DOX', decimal: 18, totalSupply: 0 });
  const [projectinfo, setProjectInfo] = useState({ volume: 0, ethPrice: 0, price: 0, totalReward: 0 });
  const [userinfo, setUserInfo] = useState({ balance: 0, pendingReward: 0 });

  const [unlockinfo, setUnLockInfo] = useState(null);
  const [lockinfo, setLockInfo] = useState(null);
  const [lockups, setLockUps] = useState([{}, {}]);
  const [lockallow, setLockAllow] = useState(false);
  const [unlockallow, setUnLockAllow] = useState(false);

  useEffect(() => {
    if (hasCachedProvider()) {
      // then user DOES have a wallet
      connect().then(() => {
        setWalletChecked(true);
      });
    } else {
      // then user DOES NOT have a wallet
      setWalletChecked(true);
    }

    // We want to ensure that we are storing the UTM parameters for later, even if the user follows links
    storeQueryParameters();
  }, []);



  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSidebarClose = () => {
    setIsSidebarExpanded(false);
  };

  let themeMode = theme === "light" ? darkTheme : theme === "dark" ? darkTheme : darkTheme;

  useEffect(() => {
    themeMode = theme === "light" ? darkTheme : darkTheme;
  }, [theme]);

  useEffect(() => {
    if (isSidebarExpanded) handleSidebarClose();
  }, [location]);
  const path = useMemo(() => window.location.pathname, [window.location.pathname]);


  return (
    <Router>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />

        {/* {isAppLoading && <LoadingSplash />} */}
        <div className={`app ${isSmallerScreen && "tablet"} ${isSmallScreen && "mobile"} light`}>
          <Messages />
          {path === "/" ? null : (
            <TopBar theme={theme} toggleTheme={toggleTheme} handleDrawerToggle={handleDrawerToggle} />
          )}
          {path === "/" ? null : (
            <nav className={classes.drawer}>
              {isSmallerScreen ? (
                <NavDrawer mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
              ) : (
                <Sidebar />
              )}
            </nav>
          )}

          <div className={`${path === "/" ? null : classes.content} ${isSmallerScreen && classes.contentShift}`}>
            <Switch>
              <Route exact path="/dashboard">
                <TreasuryDashboard />

              </Route>
              <Route exact path="/reward">
                <Swap
                  account={address} />

              </Route>
              <Route exact path="/">
                <Redirect to="reward" />
              </Route>
            </Switch>
          </div>
        </div>
      </ThemeProvider>
    </Router>
  );
}

export default App;
