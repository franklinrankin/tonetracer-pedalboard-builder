// Famous players associated with each pedal subtype
// Tagged with genres for appropriate suggestions

export type PlayerGenre = 
  | 'rock' | 'blues' | 'metal' | 'jazz' | 'country' 
  | 'indie' | 'alternative' | 'punk' | 'shoegaze' 
  | 'ambient' | 'funk' | 'pop' | 'progressive' | 'classic-rock';

export interface Player {
  name: string;
  genres: PlayerGenre[];
  isOrigin?: boolean; // True if they originated/popularized the sound
}

export const PEDAL_PLAYERS: Record<string, Player[]> = {
  // ==================== BOOST ====================
  'Clean Boost': [
    { name: 'Eric Clapton', genres: ['blues', 'classic-rock', 'rock'], isOrigin: true },
    { name: 'John Mayer', genres: ['blues', 'pop', 'rock'] },
    { name: 'The Edge', genres: ['rock', 'alternative', 'ambient'] },
    { name: 'Brian May', genres: ['rock', 'classic-rock'] },
    { name: 'Brent Mason', genres: ['country'] },
    { name: 'Brad Paisley', genres: ['country'] },
  ],
  'Mid Boost': [
    { name: 'Stevie Ray Vaughan', genres: ['blues', 'rock'], isOrigin: true },
    { name: 'Gary Moore', genres: ['blues', 'rock', 'metal'] },
    { name: 'Joe Bonamassa', genres: ['blues', 'rock'] },
    { name: 'Eric Johnson', genres: ['rock', 'blues', 'jazz'] },
    { name: 'Robben Ford', genres: ['blues', 'jazz'] },
  ],
  'Treble Boost': [
    { name: 'Brian May', genres: ['rock', 'classic-rock'], isOrigin: true },
    { name: 'Tony Iommi', genres: ['metal', 'rock', 'classic-rock'] },
    { name: 'Ritchie Blackmore', genres: ['rock', 'classic-rock'] },
    { name: 'Rory Gallagher', genres: ['blues', 'rock'] },
  ],

  // ==================== OVERDRIVE ====================
  'Bluesbreaker-style': [
    { name: 'Eric Clapton', genres: ['blues', 'classic-rock', 'rock'], isOrigin: true },
    { name: 'John Mayer', genres: ['blues', 'pop', 'rock'] },
    { name: 'Alex Turner', genres: ['indie', 'rock', 'alternative'] },
    { name: 'Dan Auerbach', genres: ['blues', 'rock', 'indie'] },
    { name: 'Gary Clark Jr.', genres: ['blues', 'rock'] },
  ],
  'Tube Screamer-style': [
    { name: 'Stevie Ray Vaughan', genres: ['blues', 'rock'], isOrigin: true },
    { name: 'John Mayer', genres: ['blues', 'pop', 'rock'] },
    { name: 'Kenny Wayne Shepherd', genres: ['blues', 'rock'] },
    { name: 'Kirk Hammett', genres: ['metal', 'rock'] },
    { name: 'Trey Anastasio', genres: ['rock', 'jazz', 'progressive'] },
    { name: 'The Edge', genres: ['rock', 'alternative', 'ambient'] },
  ],
  'Klon-style': [
    { name: 'Jeff Beck', genres: ['rock', 'blues', 'jazz'], isOrigin: true },
    { name: 'John Mayer', genres: ['blues', 'pop', 'rock'] },
    { name: 'Nels Cline', genres: ['jazz', 'alternative', 'ambient'] },
    { name: 'Joe Bonamassa', genres: ['blues', 'rock'] },
    { name: 'Josh Smith', genres: ['blues', 'rock'] },
  ],
  'Transparent OD': [
    { name: 'Bill Frisell', genres: ['jazz', 'ambient', 'alternative'], isOrigin: true },
    { name: 'Julian Lage', genres: ['jazz', 'rock'] },
    { name: 'Andy Timmons', genres: ['rock', 'blues'] },
    { name: 'Guthrie Govan', genres: ['rock', 'jazz', 'progressive'] },
    { name: 'Mateus Asato', genres: ['pop', 'rock', 'blues'] },
  ],
  'Amp-like OD': [
    { name: 'Neil Young', genres: ['rock', 'classic-rock', 'country'], isOrigin: true },
    { name: 'Noel Gallagher', genres: ['rock', 'indie', 'alternative'] },
    { name: 'Dan Auerbach', genres: ['blues', 'rock', 'indie'] },
    { name: 'Jack White', genres: ['rock', 'blues', 'alternative'] },
    { name: 'Josh Homme', genres: ['rock', 'alternative', 'metal'] },
  ],

  // ==================== DISTORTION ====================
  'RAT-style': [
    { name: 'Johnny Greenwood', genres: ['alternative', 'rock', 'ambient'] },
    { name: 'Kurt Cobain', genres: ['alternative', 'rock', 'punk'] },
    { name: 'Thom Yorke', genres: ['alternative', 'ambient', 'rock'] },
    { name: 'Jeff Buckley', genres: ['rock', 'alternative'] },
    { name: 'Dave Grohl', genres: ['rock', 'alternative', 'punk'] },
  ],
  'Marshall-style': [
    { name: 'Angus Young', genres: ['rock', 'classic-rock'], isOrigin: true },
    { name: 'Jimmy Page', genres: ['rock', 'classic-rock', 'blues'] },
    { name: 'Slash', genres: ['rock', 'classic-rock'] },
    { name: 'Eddie Van Halen', genres: ['rock', 'metal'] },
    { name: 'Joe Perry', genres: ['rock', 'classic-rock'] },
  ],
  'Hard-Clipping Distortion': [
    { name: 'Johnny Ramone', genres: ['punk', 'rock'] },
    { name: 'Bob Mould', genres: ['punk', 'alternative', 'rock'] },
    { name: 'Jack White', genres: ['rock', 'blues', 'alternative'] },
    { name: 'J Mascis', genres: ['alternative', 'rock', 'indie'] },
  ],
  'High-Gain / Metal Distortion': [
    { name: 'James Hetfield', genres: ['metal', 'rock'] },
    { name: 'Dimebag Darrell', genres: ['metal'] },
    { name: 'Adam Jones', genres: ['metal', 'progressive', 'rock'] },
    { name: 'John Petrucci', genres: ['metal', 'progressive'] },
    { name: 'Mark Tremonti', genres: ['metal', 'rock'] },
  ],

  // ==================== FUZZ ====================
  'Fuzz Face-style': [
    { name: 'Jimi Hendrix', genres: ['rock', 'blues', 'classic-rock'], isOrigin: true },
    { name: 'Eric Johnson', genres: ['rock', 'blues', 'jazz'] },
    { name: 'David Gilmour', genres: ['rock', 'progressive', 'classic-rock'] },
    { name: 'Joe Bonamassa', genres: ['blues', 'rock'] },
    { name: 'Robin Trower', genres: ['blues', 'rock'] },
  ],
  'Tone Bender-style': [
    { name: 'Jimmy Page', genres: ['rock', 'classic-rock', 'blues'], isOrigin: true },
    { name: 'Jeff Beck', genres: ['rock', 'blues', 'jazz'] },
    { name: 'Mick Ronson', genres: ['rock', 'classic-rock'] },
    { name: 'Syd Barrett', genres: ['rock', 'progressive'] },
  ],
  'Muff-style': [
    { name: 'David Gilmour', genres: ['rock', 'progressive', 'classic-rock'], isOrigin: true },
    { name: 'Billy Corgan', genres: ['alternative', 'rock'] },
    { name: 'J Mascis', genres: ['alternative', 'rock', 'indie'] },
    { name: 'Jack White', genres: ['rock', 'blues', 'alternative'] },
    { name: 'Dan Auerbach', genres: ['blues', 'rock', 'indie'] },
  ],
  'Gated Fuzz': [
    { name: 'Jack White', genres: ['rock', 'blues', 'alternative'] },
    { name: 'Matt Bellamy', genres: ['rock', 'alternative', 'progressive'] },
    { name: 'Josh Homme', genres: ['rock', 'alternative', 'metal'] },
    { name: 'Omar Rodriguez-Lopez', genres: ['progressive', 'rock', 'alternative'] },
  ],
  'Octave Fuzz': [
    { name: 'Jimi Hendrix', genres: ['rock', 'blues', 'classic-rock'], isOrigin: true },
    { name: 'Eric Johnson', genres: ['rock', 'blues', 'jazz'] },
    { name: 'Josh Homme', genres: ['rock', 'alternative', 'metal'] },
    { name: 'Tom Morello', genres: ['rock', 'alternative', 'metal'] },
  ],

  // ==================== MODULATION ====================
  'Chorus': [
    { name: 'Andy Summers', genres: ['rock', 'jazz', 'pop'], isOrigin: true },
    { name: 'Johnny Marr', genres: ['indie', 'alternative', 'rock'] },
    { name: 'Alex Lifeson', genres: ['progressive', 'rock'] },
    { name: 'Kurt Cobain', genres: ['alternative', 'rock', 'punk'] },
    { name: 'John Frusciante', genres: ['rock', 'funk', 'alternative'] },
  ],
  'Phaser': [
    { name: 'Eddie Van Halen', genres: ['rock', 'metal'] },
    { name: 'Billy Corgan', genres: ['alternative', 'rock'] },
    { name: 'David Gilmour', genres: ['rock', 'progressive', 'classic-rock'] },
    { name: 'Alex Lifeson', genres: ['progressive', 'rock'] },
    { name: 'Kevin Shields', genres: ['shoegaze', 'alternative'] },
  ],
  'Flanger': [
    { name: 'David Gilmour', genres: ['rock', 'progressive', 'classic-rock'] },
    { name: 'Andy Summers', genres: ['rock', 'jazz', 'pop'] },
    { name: 'The Edge', genres: ['rock', 'alternative', 'ambient'] },
    { name: 'Eddie Van Halen', genres: ['rock', 'metal'] },
  ],
  'Tremolo': [
    { name: 'Bo Diddley', genres: ['blues', 'rock'], isOrigin: true },
    { name: 'Neil Young', genres: ['rock', 'classic-rock', 'country'] },
    { name: 'Jack White', genres: ['rock', 'blues', 'alternative'] },
    { name: 'Johnny Greenwood', genres: ['alternative', 'rock', 'ambient'] },
    { name: 'Duane Eddy', genres: ['rock', 'country'] },
  ],
  'Vibrato': [
    { name: 'Kevin Shields', genres: ['shoegaze', 'alternative'], isOrigin: true },
    { name: 'Mac DeMarco', genres: ['indie', 'rock', 'pop'] },
    { name: 'Thurston Moore', genres: ['alternative', 'rock', 'shoegaze'] },
    { name: 'J Mascis', genres: ['alternative', 'rock', 'indie'] },
  ],
  'Univibe / Rotary': [
    { name: 'Jimi Hendrix', genres: ['rock', 'blues', 'classic-rock'], isOrigin: true },
    { name: 'Robin Trower', genres: ['blues', 'rock'] },
    { name: 'David Gilmour', genres: ['rock', 'progressive', 'classic-rock'] },
    { name: 'Stevie Ray Vaughan', genres: ['blues', 'rock'] },
  ],

  // ==================== DELAY ====================
  'Analog-style Delay': [
    { name: 'David Gilmour', genres: ['rock', 'progressive', 'classic-rock'], isOrigin: true },
    { name: 'John Frusciante', genres: ['rock', 'funk', 'alternative'] },
    { name: 'The Edge', genres: ['rock', 'alternative', 'ambient'] },
    { name: 'Albert Hammond Jr.', genres: ['indie', 'rock'] },
    { name: 'Dan Auerbach', genres: ['blues', 'rock', 'indie'] },
  ],
  'Tape-style Delay': [
    { name: 'Jimmy Page', genres: ['rock', 'classic-rock', 'blues'], isOrigin: true },
    { name: 'David Gilmour', genres: ['rock', 'progressive', 'classic-rock'] },
    { name: 'Brian Setzer', genres: ['rock', 'country', 'blues'] },
    { name: 'Chris Isaak', genres: ['rock', 'country', 'pop'] },
  ],
  'Digital Delay': [
    { name: 'The Edge', genres: ['rock', 'alternative', 'ambient'], isOrigin: true },
    { name: 'Andy Summers', genres: ['rock', 'jazz', 'pop'] },
    { name: 'Mike Einziger', genres: ['rock', 'alternative'] },
    { name: 'Tom Morello', genres: ['rock', 'alternative', 'metal'] },
  ],
  'Multi / Experimental Delay': [
    { name: 'Jonny Greenwood', genres: ['alternative', 'rock', 'ambient'] },
    { name: 'Nels Cline', genres: ['jazz', 'alternative', 'ambient'] },
    { name: 'Ed O\'Brien', genres: ['alternative', 'rock', 'ambient'] },
    { name: 'Kevin Shields', genres: ['shoegaze', 'alternative'] },
  ],

  // ==================== REVERB ====================
  'Spring': [
    { name: 'Dick Dale', genres: ['rock'], isOrigin: true },
    { name: 'Duane Eddy', genres: ['rock', 'country'] },
    { name: 'Stevie Ray Vaughan', genres: ['blues', 'rock'] },
    { name: 'Chris Isaak', genres: ['rock', 'country', 'pop'] },
    { name: 'Brian Setzer', genres: ['rock', 'country', 'blues'] },
  ],
  'Plate': [
    { name: 'George Harrison', genres: ['rock', 'classic-rock'] },
    { name: 'Prince', genres: ['pop', 'funk', 'rock'] },
    { name: 'Johnny Marr', genres: ['indie', 'alternative', 'rock'] },
    { name: 'Daniel Lanois', genres: ['ambient', 'rock', 'country'] },
  ],
  'Hall': [
    { name: 'David Gilmour', genres: ['rock', 'progressive', 'classic-rock'] },
    { name: 'Mark Knopfler', genres: ['rock', 'country', 'blues'] },
    { name: 'The Edge', genres: ['rock', 'alternative', 'ambient'] },
    { name: 'Alex Lifeson', genres: ['progressive', 'rock'] },
  ],
  'Room': [
    { name: 'Neil Young', genres: ['rock', 'classic-rock', 'country'], isOrigin: true },
    { name: 'Jack White', genres: ['rock', 'blues', 'alternative'] },
    { name: 'Dan Auerbach', genres: ['blues', 'rock', 'indie'] },
    { name: 'John Frusciante', genres: ['rock', 'funk', 'alternative'] },
  ],
  'Ambient / Shimmer': [
    { name: 'The Edge', genres: ['rock', 'alternative', 'ambient'], isOrigin: true },
    { name: 'Michael Brook', genres: ['ambient', 'rock'] },
    { name: 'Ed O\'Brien', genres: ['alternative', 'rock', 'ambient'] },
    { name: 'Kevin Shields', genres: ['shoegaze', 'alternative'] },
    { name: 'Robert Fripp', genres: ['progressive', 'ambient', 'rock'] },
  ],

  // ==================== DYNAMICS ====================
  'Compressor': [
    { name: 'Mark Knopfler', genres: ['rock', 'country', 'blues'], isOrigin: true },
    { name: 'Nile Rodgers', genres: ['funk', 'pop', 'rock'] },
    { name: 'Brent Mason', genres: ['country'] },
    { name: 'Trey Anastasio', genres: ['rock', 'jazz', 'progressive'] },
    { name: 'Cory Wong', genres: ['funk', 'pop', 'jazz'] },
  ],
  'Noise Gate': [
    { name: 'James Hetfield', genres: ['metal', 'rock'] },
    { name: 'Dimebag Darrell', genres: ['metal'] },
    { name: 'Adam Jones', genres: ['metal', 'progressive', 'rock'] },
    { name: 'John Petrucci', genres: ['metal', 'progressive'] },
  ],

  // ==================== FILTER ====================
  'Wah': [
    { name: 'Jimi Hendrix', genres: ['rock', 'blues', 'classic-rock'], isOrigin: true },
    { name: 'Eric Clapton', genres: ['blues', 'classic-rock', 'rock'] },
    { name: 'Slash', genres: ['rock', 'classic-rock'] },
    { name: 'Kirk Hammett', genres: ['metal', 'rock'] },
    { name: 'John Frusciante', genres: ['rock', 'funk', 'alternative'] },
  ],
  'Envelope Filter': [
    { name: 'Bootsy Collins', genres: ['funk'], isOrigin: true },
    { name: 'Jerry Garcia', genres: ['rock', 'jazz', 'country'] },
    { name: 'John Frusciante', genres: ['rock', 'funk', 'alternative'] },
    { name: 'Frank Zappa', genres: ['rock', 'jazz', 'progressive'] },
  ],
  'Fixed Filter': [
    { name: 'Jonny Greenwood', genres: ['alternative', 'rock', 'ambient'] },
    { name: 'Trent Reznor', genres: ['alternative', 'rock', 'metal'] },
    { name: 'Kevin Shields', genres: ['shoegaze', 'alternative'] },
  ],

  // ==================== PITCH ====================
  'Octave': [
    { name: 'Jimi Hendrix', genres: ['rock', 'blues', 'classic-rock'], isOrigin: true },
    { name: 'Jack White', genres: ['rock', 'blues', 'alternative'] },
    { name: 'Tom Morello', genres: ['rock', 'alternative', 'metal'] },
    { name: 'Royal Blood', genres: ['rock', 'alternative'] },
  ],
  'Harmony': [
    { name: 'Brian May', genres: ['rock', 'classic-rock'], isOrigin: true },
    { name: 'Dave Murray', genres: ['metal', 'rock'] },
    { name: 'Steve Vai', genres: ['rock', 'metal', 'progressive'] },
  ],
  'Pitch Shift / Whammy': [
    { name: 'Tom Morello', genres: ['rock', 'alternative', 'metal'], isOrigin: true },
    { name: 'Matt Bellamy', genres: ['rock', 'alternative', 'progressive'] },
    { name: 'Jack White', genres: ['rock', 'blues', 'alternative'] },
    { name: 'The Edge', genres: ['rock', 'alternative', 'ambient'] },
  ],

  // ==================== SYNTH / SPECIAL EFFECTS ====================
  'Synth': [
    { name: 'St. Vincent', genres: ['alternative', 'indie', 'rock'] },
    { name: 'Matt Bellamy', genres: ['rock', 'alternative', 'progressive'] },
    { name: 'Ed O\'Brien', genres: ['alternative', 'rock', 'ambient'] },
    { name: 'Omar Rodriguez-Lopez', genres: ['progressive', 'rock', 'alternative'] },
  ],
  'Ring Mod': [
    { name: 'Jonny Greenwood', genres: ['alternative', 'rock', 'ambient'], isOrigin: true },
    { name: 'Adrian Belew', genres: ['progressive', 'rock', 'jazz'] },
    { name: 'Tom Morello', genres: ['rock', 'alternative', 'metal'] },
  ],
  'Bitcrusher': [
    { name: 'Trent Reznor', genres: ['alternative', 'rock', 'metal'] },
    { name: 'Jonny Greenwood', genres: ['alternative', 'rock', 'ambient'] },
    { name: 'Matt Bellamy', genres: ['rock', 'alternative', 'progressive'] },
  ],
  'Freeze / Sustain': [
    { name: 'The Edge', genres: ['rock', 'alternative', 'ambient'] },
    { name: 'Jónsi', genres: ['ambient', 'rock', 'alternative'] },
    { name: 'Ed O\'Brien', genres: ['alternative', 'rock', 'ambient'] },
    { name: 'Kevin Shields', genres: ['shoegaze', 'alternative'] },
  ],
  'Glitch / Granular': [
    { name: 'Jonny Greenwood', genres: ['alternative', 'rock', 'ambient'] },
    { name: 'Nels Cline', genres: ['jazz', 'alternative', 'ambient'] },
    { name: 'St. Vincent', genres: ['alternative', 'indie', 'rock'] },
    { name: 'Ed O\'Brien', genres: ['alternative', 'rock', 'ambient'] },
  ],

  // ==================== UTILITY ====================
  'Tuner': [],
  'Buffer': [],
  'Loop Switcher': [],
  'A/B / A/B/Y': [],
  'Splitter / Mixer': [],
  'Mute': [],

  // ==================== AMP ====================
  'Preamp': [
    { name: 'The Edge', genres: ['rock', 'alternative', 'ambient'] },
    { name: 'Alex Lifeson', genres: ['progressive', 'rock'] },
  ],
  'Amp-in-a-Box': [
    { name: 'Billy Gibbons', genres: ['blues', 'rock'] },
    { name: 'Dan Auerbach', genres: ['blues', 'rock', 'indie'] },
    { name: 'Jack White', genres: ['rock', 'blues', 'alternative'] },
  ],
  'Cab Sim / IR Loader': [
    { name: 'Tosin Abasi', genres: ['metal', 'progressive'] },
    { name: 'Devin Townsend', genres: ['metal', 'progressive', 'ambient'] },
  ],

  // ==================== VOLUME ====================
  'Volume': [
    { name: 'The Edge', genres: ['rock', 'alternative', 'ambient'] },
    { name: 'David Gilmour', genres: ['rock', 'progressive', 'classic-rock'] },
    { name: 'Buddy Guy', genres: ['blues'] },
  ],
  'Expression': [],

  // ==================== EQ ====================
  'EQ': [
    { name: 'David Gilmour', genres: ['rock', 'progressive', 'classic-rock'] },
    { name: 'Zakk Wylde', genres: ['metal', 'rock'] },
    { name: 'Steve Vai', genres: ['rock', 'metal', 'progressive'] },
  ],
};

// Map genre names to PlayerGenre
export const GENRE_TO_PLAYER_GENRE: Record<string, PlayerGenre[]> = {
  'Classic Rock': ['classic-rock', 'rock', 'blues'],
  'Blues': ['blues', 'rock'],
  'Country': ['country', 'rock'],
  'Metal': ['metal', 'rock'],
  'Jazz': ['jazz', 'blues'],
  'Indie / Alternative': ['indie', 'alternative', 'rock'],
  'Pop': ['pop', 'rock', 'indie'],
  'Punk': ['punk', 'rock', 'alternative'],
  'Shoegaze': ['shoegaze', 'alternative', 'ambient'],
  'Ambient / Post-Rock': ['ambient', 'rock', 'shoegaze', 'progressive'],
  'Funk': ['funk', 'rock', 'blues'],
  'R&B / Soul': ['funk', 'pop', 'blues'],
  'Progressive': ['progressive', 'rock', 'metal', 'jazz'],
  'Lo-Fi': ['indie', 'alternative', 'rock'],
  'Surf': ['rock', 'classic-rock'],
  'Experimental': ['alternative', 'ambient', 'progressive'],
  // Generic fallback
  'Rock': ['rock', 'classic-rock', 'blues'],
};

/**
 * Get genre-appropriate players for a pedal subtype
 */
export function getPlayersForSubtype(
  subtype: string | undefined,
  genreName: string,
  count: number = 3
): string[] {
  if (!subtype) return [];
  
  const players = PEDAL_PLAYERS[subtype];
  if (!players || players.length === 0) return [];
  
  // Get the player genres that match this board genre
  const targetGenres = GENRE_TO_PLAYER_GENRE[genreName] || ['rock'];
  
  // Score players by how well they match the genre
  const scored = players.map(player => {
    const matchCount = player.genres.filter(g => targetGenres.includes(g)).length;
    return { player, score: matchCount + (player.isOrigin ? 0.5 : 0) };
  });
  
  // Sort by score (highest first), then shuffle within same score for variety
  scored.sort((a, b) => b.score - a.score);
  
  // Take the top matches
  const topPlayers = scored
    .filter(s => s.score > 0)
    .slice(0, count)
    .map(s => s.player.name);
  
  // If not enough genre matches, fill with any players
  if (topPlayers.length < count) {
    const remaining = players
      .filter(p => !topPlayers.includes(p.name))
      .slice(0, count - topPlayers.length)
      .map(p => p.name);
    topPlayers.push(...remaining);
  }
  
  return topPlayers.slice(0, count);
}
