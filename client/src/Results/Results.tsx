import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Fade from '@material-ui/core/Fade';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import {SearchResult} from '../api';
import './Results.css';

type Props = {
  searchResults: SearchResult[];
  searchTerm: string;
};

export const Results: React.FunctionComponent<Props> = ({searchResults, searchTerm}) => {
  return (
    <Box className="search-results">
      <Grid container spacing={5}>
        {searchResults && searchResults.map(result => {
          return (
            <Grid item sm={12} md={6} key={result.url}>
              <Fade in={true} timeout={500} >
                <Paper elevation={2}>
                  <Box display="flex" className="search-result">
                    <Box className="img-container">
                      <img src={result.screenshotUrl} alt="page screenshot"></img>
                    </Box>
                    <Box display="flex" className="search-result-content">
                      <Box className="search-result-title" lineHeight="normal">
                        <Link href={result.url}
                          target="_blank"
                          variant={"subtitle1"}
                          underline={"hover"}>{result.title}</Link>
                      </Box>
                      <div className="search-result-snippets">
                        <Typography variant="body2" >
                          {result.snippets.map((snippet, i) => <span key={i} dangerouslySetInnerHTML={{__html: highlight(snippet, searchTerm)}}></span>)}
                        </Typography>
                      </div>
                    </Box>
                  </Box>
                </Paper>
              </Fade>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

function highlight(text: string, searchString: string) {
  const searchItems = searchString.split(/\s/);
  const regExp = new RegExp('(' + searchItems.join('|') + ')', 'ig');
  return text.replace(regExp, '<mark>$1</mark>');
} 