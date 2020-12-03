/* eslint-disable no-param-reassign */
function autocomplete(input, lngInput, latInput) {
  if (!input) return;

  // eslint-disable-next-line no-undef
  const dropdown = new google.maps.places.Autocomplete(input);
  dropdown.addListener('place_changed', () => {
    const place = dropdown.getPlace();

    const { lat, lng } = place.geometry.location;
    lngInput.value = lng();
    latInput.value = lat();
  });

  input.on('keydown', (e) => {
    if (e.keyCode === 13) e.preventDefault();
  });
}

export default autocomplete;
