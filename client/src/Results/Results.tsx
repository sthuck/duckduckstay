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
};

export const Results: React.FunctionComponent<Props> = ({searchResults}) => {
  return (
    <Box className="search-results">
      <Grid container spacing={5}>
        {searchResults && searchResults.map(result => {
          return (
            <Grid item sm={12} md={6} key={result.url}>
              <Fade in={true} timeout={500} >
                <Paper elevation={2}>
                  <Box display="flex" className="search-result">
                    <img src={result.screenshotUrl}></img>
                    <Box display="flex" className="search-result-content">
                      <Box className="search-result-title" lineHeight="normal">
                        <Link href={result.url}
                          target="_blank"
                          variant={"subtitle1"}
                          underline={"hover"}>{result.title}</Link>
                      </Box>
                      <div className="search-result-snippets">
                        <Typography variant="body2" >
                          {result.snippets.map((snippet, i) => <span key={i}>{snippet}</span>)}
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