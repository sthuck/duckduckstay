import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import Typography from '@material-ui/core/Typography';
import Fade from '@material-ui/core/Fade';
import {createMuiTheme, ThemeProvider, makeStyles} from '@material-ui/core/styles';
import Search from '@material-ui/icons/Search';
import {useSearchInputStyles} from '@mui-treasury/styles/input/search';
import React, {useState} from 'react';
import {search, SearchResult} from './api';
import './App.css';
import {Results} from './Results/Results';

const theme = createMuiTheme({
  "palette": {
    primary: {main: "#00b8d4"},
    secondary: {main: "#ff80ab", }
  },
});

function App() {
  const inputStyle = makeStyles({
    root: {
      backgroundColor: "#e7e7e7"
    }
  })();
  const styles = {...useSearchInputStyles(theme), root: inputStyle.root};
  const [pending, setPending] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const onSearch = () => {
    setPending(true);
    setSearchResults(null);
    search(searchTerm).then((data) => {
      setPending(false);
      setSearchResults(data);
    });
  };
  const searchBoxClasses = ['search-box'].concat((pending || searchResults) ? [] : ['no-results']).join(' ');
  return (
    <div className="App">
      <CssBaseline>
        <ThemeProvider theme={theme}>
          <Container className="main">
            <Box className={searchBoxClasses}>
              <Box onClick={() => window.location.reload()} className="title">
                <Typography variant="h3">DuckDuckStay</Typography>
              </Box>
              <OutlinedInput
                className="search-input"
                classes={styles}
                value={searchTerm}
                onChange={e => setSearchTerm(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onSearch();
                  }
                }}
                color={'secondary'}
                placeholder={'Enter your search term'}
                startAdornment={<Search />}
              />
            </Box>
            <Fade in={pending} mountOnEnter unmountOnExit >
              <CircularProgress color="secondary" className="loader" size={80} thickness={4} />
            </Fade>
            {searchResults && <Results searchResults={searchResults} searchTerm={searchTerm}></Results>}
          </Container>
        </ThemeProvider>
      </CssBaseline>
    </div>
  );
}

export default App;
