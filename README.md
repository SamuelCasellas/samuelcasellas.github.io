# Initial Thoughts

// HEY TODO: YOU NEED A BACKGROUND SCRIPTING SERVER THAT YOUR EXTENSION NEEDS TO INTERACt WITH IF YOU WANT TO IMPLEMENT LIBRARY OF BABEL AS A PASSWORD MANAGER!!!

# Concerns
## Grant
- Entropy (randomness)
- Risks of using security questions
- syncing
  - solution would be to just generate a predictive password based on the seed
## Brother Keers
"Thanks for the message. I see what you're going for but I have some concerns. Using a single passkey to generate passwords for every service has the same weakness as reusing a password. If that passkey is compromised everything is at risk.

You could try improving the model by combining the passkey with some other input like a short number or a round count in the algorithm. That would make the output more varied, but it also depends on users being disciplined and not reusing that extra input.

It's an interesting academic idea but in practice I think it introduces more risk than it solves. Most users would struggle to manage it securely.

There have been similar approaches in the past like LessPass and Password Hasher browser extensions that use deterministic generation based on a master key and site name. They never really caught on outside niche user groups because of usability issues and lack of recovery options. Today most people rely on password managers that store encrypted passwords or use hardware-backed passkeys for better balance between security and convenience."

# Requirements:
- We will enforce that the master key used is at least 12 characters long

