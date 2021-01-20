/*
Import custom packages
*/
const dataService = require('../../services/dataService');
const { HTTPError, handleHTTPError } = require('../../utils');

/*
Get all matches
*/
const getMatches = (req, res, next) => {
  try {
    const matches = dataService.getMatches();

    res.status(200).json(matches)
  } catch (error) {
    handleHTTPError(error, next);
  }
};

/*
Get a specific match
*/
const getMatchByIds = (req, res, next) => {
  try {
    const { senderId, receiverId } = req.params;
    const match = dataService.getMatchByIds(senderId, receiverId);

    res.status(200).json(match);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

/*
Get matches from a specific user
*/
const getMatchesFromUserById = (req, res, next) => {
  try {
    const { userId } = req.params;
    const matches = dataService.getMatchesFromUserById(userId);
  
    res.status(200).json(matches);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

/*
Create a new match
*/
const createMatch = (req, res, next) => {
  try {
    const match = req.body;
    const createdMatch = dataService.createMatch(match);

    res.status(201).json(createdMatch);
  } catch (error) {
    handleHTTPError(error, next);
  }
};

/*
Update a specific match
*/
const updateMatch = (req, res, next) => {
  handleHTTPError(new HTTPError('The action method is not yet implemented!', 501), next);
};

/*
Delete a specific match
*/
const deleteMatch = (req, res, next) => {
  handleHTTPError(new HTTPError('The action method is not yet implemented!', 501), next);
};

// Export the action methods = callbacks
module.exports = {
  createMatch,
  deleteMatch,
  getMatches,
  getMatchByIds,
  getMatchesFromUserById,
  updateMatch,
};
