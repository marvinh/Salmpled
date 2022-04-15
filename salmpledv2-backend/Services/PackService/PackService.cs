using salmpledv2_backend.Models.ServiceResponse;
using salmpledv2_backend.Models.DTOS;
using salmpledv2_backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Slugify;
using AutoMapper;
namespace salmpledv2_backend.Services
{
    public class PackService : IPackService
    {
        private readonly MyContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;


        private readonly IMapper _mapper;

        public PackService(MyContext context, IHttpContextAccessor httpContextAccessor, IMapper mapper)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
            _mapper = mapper;
        }
        public async Task<ServiceResponse<GetPackDTO>> CreatePack(CreatePackDTO newPack)
        {

            ServiceResponse<GetPackDTO> res = new ServiceResponse<GetPackDTO>();
            string? SubId = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            User? User = await _context.Users.FirstOrDefaultAsync(u => u.SubId == SubId);

            try
            {
                SlugHelper helper = new SlugHelper();
                var pack = new Pack
                {
                    Id = Guid.NewGuid(),
                    Name = newPack.Name,
                    Description = newPack.Description,
                    UserId = User.Id,
                    Slug = helper.GenerateSlug(newPack.Name)
                };
                await _context.Packs.AddAsync(pack);
                List<Genre> list = new List<Genre>();
                List<PackGenre> packGenres = new List<PackGenre>();
                foreach (var g in newPack.Genres)
                {
                    if (g.Id == null)
                    {
                        var newGenre = new Genre
                        {
                            Id = Guid.NewGuid(),
                            Name = g.Name,
                        };

                        list.Add(newGenre);
                        packGenres.Add(
                            new PackGenre
                            {
                                PackId = pack.Id,
                                GenreId = newGenre.Id,
                            }
                        );

                    }
                    else
                    {
                        packGenres.Add(new PackGenre
                        {
                            PackId = pack.Id,
                            GenreId = g.Id.GetValueOrDefault(),
                        });
                    }
                }

                await _context.Genres.AddRangeAsync(list);
                await _context.PackGenres.AddRangeAsync(packGenres);
                await _context.SaveChangesAsync();
                res.Result = _mapper.Map<GetPackDTO>(pack);
            }
            catch (Exception e)
            {
                res.Err = e.Message;
            }

            return res;

        }

        public async Task<ServiceResponse<GetPackDTO>> GetPackFromPackSlugDTO(PackSlugDTO dto)
        {
            ServiceResponse<GetPackDTO> res = new ServiceResponse<GetPackDTO>();
            try
            {
                var pack = await _context.Packs
                .Where(p => p.Slug == dto.Slug && p.User.Username == dto.Username)
                .Include(s => s.User)
                .Include(s => s.Group).ThenInclude(s => s.UserGroups).ThenInclude(s => s.User)
                .Include(s => s.PackGenres).ThenInclude(s => s.Genre)
                .Include(s => s.Samples).ThenInclude(s => s.SampleTags).ThenInclude(s => s.Tag)
                .FirstOrDefaultAsync();

                res.Result = _mapper.Map<GetPackDTO>(pack);

            }
            catch (Exception ex)
            {
                res.Err = ex.Message;
            }

            return res;
        }
        public async Task<ServiceResponse<String>> NameAvailable(string Name)
        {

            ServiceResponse<String> res = new ServiceResponse<String>();
            string? SubId = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            User? User = await _context.Users.FirstOrDefaultAsync(u => u.SubId == SubId);

            try
            {
                var query = from packs in _context.Packs
                            where packs.Name == Name && packs.UserId == User.Id
                            select packs;
                var pack = await query.ToListAsync();
                if (pack.LongCount() < 1)
                {
                    res.Result = "Name is unique to Account";
                }
                else
                {
                    res.Err = "Name is not unique to Account";
                }
            }
            catch (Exception e)
            {
                res.Err = e.Message;
            }

            return res;
        }
        public async Task<ServiceResponse<List<DateTime>>> HistoryOptions(PackSlugDTO dto)
        {
            var res = new ServiceResponse<List<DateTime>>();

            try
            {

                User user = await _context.Users.Where(u => u.Username == dto.Username).FirstOrDefaultAsync();
                List<DateTime> options = _context.Packs.TemporalAll()
                .Where(p => p.Slug == dto.Slug && p.UserId == user.Id)
                .OrderBy(p => EF.Property<DateTime>(p, "PeriodEnd"))
                .Select(p => (EF.Property<DateTime>(p, "PeriodEnd"))).ToList();
                res.Result = options;

            }
            catch (Exception e)
            {
                res.Err = e.Message;
            }
            return res;
        }

        public async Task<ServiceResponse<CompareDTO>> Compare(PackSlugDTO dto) {
            var res = new ServiceResponse<CompareDTO>();
            try{
                var compareTo = await _context.Packs.TemporalAsOf(dto.On)
                .Where(p => p.Slug == dto.Slug && p.User.Username == dto.Username)
                .Include(p => p.PackGenres).ThenInclude(p => p.Genre)
                .Include(s => s.Samples.OrderBy(s => s.CreatedDate)).ThenInclude(s => s.SampleTags).ThenInclude(s => s.Tag).SingleAsync();

                var current =  await _context.Packs
                .Where(p => p.Slug == dto.Slug && p.User.Username == dto.Username)
                .Include(p => p.PackGenres).ThenInclude(p => p.Genre)
                .Include(s => s.Samples.OrderBy(s => s.CreatedDate)).ThenInclude(s => s.SampleTags).ThenInclude(s => s.Tag).SingleAsync();

                res.Result = new CompareDTO{Current = _mapper.Map<GetPackDTO>(current), Compare =_mapper.Map<GetPackDTO>(compareTo)};
            } catch(Exception e) {
                res.Err = e.Message;

            }

            return res;
        }
        public async Task<ServiceResponse<List<PeriodDTO>>> History(PackSlugDTO dto)
        {
            var res = new ServiceResponse<List<PeriodDTO>>();
            try
            {
                var packSnapshots = _context.Packs

                .TemporalAll()
                // .Include(s => s.PackGenres).ThenInclude(s => s.Genre)
                .Where(p => p.Slug == dto.Slug)
                // .TemporalAll()
                .OrderBy(p => EF.Property<DateTime>(p, "PeriodEnd"))

                // .Where(p => p.Pack.Slug == dto.Slug && p.Pack.User.Username == dto.Username)
                .Select(p =>
                   new
                   {
                       Pack = p,
                       PeriodStart = EF.Property<DateTime>(p, "PeriodStart"),
                       PeriodEnd = EF.Property<DateTime>(p, "PeriodEnd")
                   }
                )
                .ToList();

                List<PeriodDTO> list = packSnapshots.Select(ele =>
                    new PeriodDTO
                    {
                        Pack = _mapper.Map<GetPackDTO>(_context.Packs.TemporalAsOf(ele.PeriodEnd).Where(p => p.Id == ele.Pack.Id).Include(p => p.Samples).FirstOrDefault()),
                        PeriodStart = ele.PeriodStart,
                        PeriodEnd = ele.PeriodEnd
                    }
                ).ToList();

                res.Result = list;

            }
            catch (Exception e)
            {
                res.Err = e.Message;
            }
            return res;
        }

        public async Task<ServiceResponse<List<GetPackDTO>>> YourSamplePacks() {

            var res = new ServiceResponse<List<GetPackDTO>>();
            string? SubId = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            User? User = await _context.Users.FirstOrDefaultAsync(u => u.SubId == SubId);
            try{
                var pack = await _context.Packs
                .Where(p => p.UserId == User.Id)
                .OrderByDescending(p => p.UpdatedDate)
                // .Include(s => s.Group).ThenInclude(s => s.UserGroups).ThenInclude(s => s.User)
                // .Include(s => s.PackGenres).ThenInclude(s => s.Genre)
                // .Include(s => s.Samples).ThenInclude(s => s.SampleTags).ThenInclude(s => s.Tag)
                .ToListAsync();

                res.Result = _mapper.Map<List<GetPackDTO>>(pack);
            }catch(Exception e){
                res.Err = e.Message;
            }

            return res;
        }

         public async Task<ServiceResponse<List<GetPackDTO>>> CollabPacks() {

            var res = new ServiceResponse<List<GetPackDTO>>();
            string? SubId = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            User? User = await _context.Users.FirstOrDefaultAsync(u => u.SubId == SubId);
            try{
                
                var groups = await _context.UserGroups.Where(u => u.UserId == User.Id).Include(s => s.Group).Select(g => g.GroupId).ToListAsync();
                
                var packs = await _context.Packs.Where(s => groups.Contains(s.GroupId ?? default)).Include(s => s.User).OrderByDescending(p => p.UpdatedDate).ToListAsync();

                res.Result = _mapper.Map<List<GetPackDTO>>(packs);
            }catch(Exception e){
                res.Err = e.Message;
            }

            return res;
        }

    


}

   





}