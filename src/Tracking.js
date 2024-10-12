export function trackEvent(event) {
  const eventId = generateEventId();
  const url = window.location.href;
  const domain = window.location.hostname;
  const timestamp = Date.now();

  const trackingData = {
    eventId: eventId,
    url: url,
    domain: domain,
    timestamp: timestamp,
    props: {
      type: "track",
      event: event,
    },
  };

  fetch("https://pulse.paywithclay.io/e", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(trackingData),
  })
    .then((response) => {
      if (!response.ok) {
        console.error("Tracking event failed:", response.statusText);
      }
    })
    .catch((error) => {
      console.error("Error sending tracking event:", error);
    });
}

function generateEventId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
