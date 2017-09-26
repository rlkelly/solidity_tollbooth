TO START:

npm install
testrpc
npm start


It was built off of create-react-app / truffle unbox react, but I ended up adding MobX and used decorators so there were a few modifications.  I rely on testrpc for development, which I noticed has a few quirks but the app works fine as long as you adhere to the existing framework.

The only I issue I ran into was the logging wouldn't always return properly, I'm still trying to get to the source of this problem.  I found a couple git issues about it and thought it could possibly be related to gas but this seems unlikely.  I saw some discussion in this SO https://ethereum.stackexchange.com/questions/15353/how-to-listen-for-contract-events-in-javascript-tests and https://ethereum.stackexchange.com/questions/15353/how-to-listen-for-contract-events-in-javascript-tests/15354 as well as https://github.com/trufflesuite/truffle/issues/136.  Regardless, it only effects the response for reportExitRoad from the Tollbooth page.  If you see this error, commenting out lines 53-61 should work as a bandaid.

Feel free to reach out with any questions!  Thanks for all the help!

-Rob Kelly
