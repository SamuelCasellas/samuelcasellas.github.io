
// Actually, you may only need to do this for the syncing part
// Fetch the contents of a page

const MAIN_DOMAIN = 'https://libraryofbabel.info/';
const BOOK_PAGE_SUB_DOMAIN = '/book.cgi?';

function announceResult(lastSubLicht, lastSubGinger, justGetNumber=false) {
fetch('https://inv.nadeko.net/channel/UCyQx8dGfgcQ4WUhrKP0ORlQ')
  .then(response => response.text())
  .then(data => {
    // Query an element by its ID
    const numSubsLicht = getNumSubs(data);
    fetch('https://inv.nadeko.net/channel/UC0I7OF7PU6V5iKy1DOql0tg')
      .then(response => response.text())
      .then(async data => {
        const numSubsGinger = getNumSubs(data);
        if (justGetNumber) {
          console.log('licht', numSubsLicht, 'ginger', numSubsGinger); return;
        }
        speak('Hello, America. We have been counting long and hard for the results of this election. You will be getting an update as promised.');
        await thisNumSeconds(2.0);
        if (numSubsLicht >= lastSubLicht && numSubsGinger >= lastSubGinger) {
          speak("Hmm. It doesn't look like we have an update yet. Please check back later!");
          return;
        }

        // Check anomoly
        if (numSubsLicht < lastSubLicht && numSubsGinger < lastSubGinger) {
          speak('WOW. Something super unlikely has happened, is there a tie?');
          return;
        }
   
        const winnerInPart = ' Yes, I just received word about who is the winner of the 2024 Presidential race and will be announcing right now. After countless ballots were counted, we can conclude that the winner of the 2024 presidential election is. are you ready? the winner is. 10. 9. 8. 7. 6. 5. 4. 3. 2. 1. ';
        speak(`${winnerInPart} ${(numSubsLicht < lastSubLicht) ? 'Donald Trump' : 'Kamala Harris'}`);

        // console.log("Allan Lichtman has", numSubs, "subs");
      })
      .catch(error => console.error('Error:', error));
  })
  .catch(error => {
    console.error('Error:', error);
  });
}



