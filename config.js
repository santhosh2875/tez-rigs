// Everything the site says lives here. Change the words, save, and reload the page.
// The company, the machines and the contact details are invented for the demo.
//
// Pictures go in assets/pc. A "file" is a picture's name without .jpg.
window.TEZ = {
  brand: "Tez",
  sub: "Rigs",
  city: "Hyderabad",
  email: "build@tezrigs.example",
  phone: "+91 40 5550 0119",

  // The opening: three PCs, then the camera goes through the glass of the middle one.
  // "file" is the picture shown before the film has loaded (and the film's first frame).
  hero: {
    file: "rigs",
    title: "No two rigs alike.",
    note: "Tez hand-builds gaming and creator PCs in Hyderabad. Forty a month, each tuned for one desk.",
    hint: "Scroll to go inside",
  },

  // Where the film ends: inside the case. Each entry of "lines" is one line of the statement.
  cabin: {
    file: "inside",
    lines: ["We don't sell boxes.", "We build your rig."],
  },

  // The picture that grows from the middle of the screen.
  approach: {
    file: "craft",
    label: "Approach",
    title: "One bench. One builder. Your machine.",
    text: "The person who takes your call routes every cable, bends every tube and signs the inside of the case when it passes.",
    button: "Spec your rig",
    facts: [
      { number: "40", label: "rigs a month" },
      { number: "72 hr", label: "stress test" },
      { number: "3 yr", label: "warranty" },
    ],
  },

  // Three ideas, one at a time. Square pictures.
  values: [
    { file: "value-1", title: "Speed", text: "We pick parts for the games you play, not for the biggest number on a box. Then we tune until the frame time is flat." },
    { file: "value-2", title: "Silence", text: "Big, slow fans and a lot of copper. At full load it is quieter than the room you are sitting in." },
    { file: "value-3", title: "Finish", text: "No fingerprints, no stray zip ties, no film left on the glass. It arrives looking like the photograph." },
  ],

  // The sentence that lights up word by word.
  line: "A machine should disappear when you play. Every part, every cable and every fan curve is chosen.",

  // What we do. Square pictures; "The build" reuses the inside picture.
  services: [
    { file: "inside", name: "The build", text: "Parts chosen for your games and your screen, assembled by one builder from the first screw." },
    { file: "cooling", name: "Cooling", text: "Hand-bent hard tubing and coolant in your colour, leak-tested for a full day before power goes in." },
    { file: "cables", name: "Cables", text: "Custom-length sleeved cables, combed straight on the side you see and the side you do not." },
    { file: "lighting", name: "Lighting", text: "One colour or a slow shift, set up before it ships, and a button to turn it all off." },
    { file: "testing", name: "Testing", text: "Seventy-two hours at full load under a thermal camera. You get the temperature report in the box." },
  ],

  start: {
    label: "Start",
    title: "Tell us what you play. We will spec the rig.",
    text: "One conversation, no cost. You get a parts list, a price and a build date within two working days.",
    button: "Spec your rig",
  },
};
