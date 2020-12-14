class TimeFormatter {
  static toNormalTime(initial) {
    const timearr = initial.split(':');
    return (
      (parseInt(timearr[0], 10) * 3600 +
        parseInt(timearr[1], 10) * 60 +
        parseInt(timearr[2], 10)) *
      1000
    );
  }

  static toTimeString(decimalT) {
    const hours = Math.floor(decimalT / (3600 * 1000));
    const minutes = Math.floor((decimalT - hours * 3600 * 1000) / (60 * 1000));
    const seconds = Math.floor(
      (decimalT - hours * 3600 * 1000 - minutes * 60 * 1000) / 1000
    );
    return hours + ':' + minutes + ':' + seconds;
  }
}

module.exports = {
  TimeFormatter: TimeFormatter,
};
