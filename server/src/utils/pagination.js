const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const parsePagination = (query) => {
  const page = query.page !== undefined ? Number(query.page) : DEFAULT_PAGE;
  const limit = query.limit !== undefined ? Number(query.limit) : DEFAULT_LIMIT;
  return { page, limit, offset: (page - 1) * limit };
};

const buildPagination = ({ page, limit, total }) => {
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  return {
    current_page: page,
    page_size: limit,
    total_records: total,
    total_pages: totalPages,
    has_next_page: page < totalPages,
    has_previous_page: page > 1 && totalPages > 0,
  };
};

module.exports = { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT, parsePagination, buildPagination };
