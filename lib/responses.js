function exception(e) {
  return {
    ok: false,
    error: e.message,
  };
}

function success(result) {
  return {
    ok: true,
    result,
  };
}

module.exports = {
  exception,
  success,
};
