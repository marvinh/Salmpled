using salmpledv2_backend.Models.ServiceResponse;
using salmpledv2_backend.Models.DTOS;
using salmpledv2_backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Slugify;
using System.Linq;
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
        public async Task<object> Search(KeywordDTO keywordDTO)
        {

            try
            {

                // var listGenre = await _context.Packs
                // .Include(p => p.PackGenres)
                // .ThenInclude(pg => pg.Genre)
                // .Where(p => p.PackGenres.Any(g => g.Genre.Name.Contains(keywordDTO.Keyword))).Select(
                //     new {
                //         Pack = _mapper.Map<GetPackDTO>(p),
                //         GenreName = p.PackGenres.Any(g => g.Genre.Name),

                //     }
                // ).ToListAsync();

                var listGenre = await _context.Genres
                .Include(p => p.PackGenres)
                .ThenInclude(p => p.Pack)
                .Where(p => p.Name == keywordDTO.Keyword)
                .Select(p =>
                    new
                    {
                        GenreName = p.Name,
                        PackCount = p.PackGenres.Count(),
                        PackIds = p.PackGenres.Select(p => p.Pack.Id)
                    }
                )
                .ToListAsync();

                var listSamples = await _context.Tags
                .Include(t => t.SampleTags)
                .ThenInclude(t => t.Sample)
                .Where(t => t.Name == keywordDTO.Keyword)
                .Select(t =>
                    new
                    {
                        TagName = t.Name,
                        SampleCount = t.SampleTags.Count(),
                        SampleIds = t.SampleTags.Select(s => s.Sample.Id)
                    }
                ).ToListAsync();

                var samples = await _context.Samples.Where(s => s.Name.Contains(keywordDTO.Keyword))
                .Select(s =>
                    new
                    {
                        SampleName = s.Name,
                        SampleId = s.Id,
                    }
                )
                .ToListAsync();

                var sampleCount = new
                {
                    SampleCount = samples.Count(),
                    Samples = samples,
                };

                var packs = await _context.Packs.Where(p => p.Name.Contains(keywordDTO.Keyword))
                .Select(p => new
                {
                    PackName = p.Name,
                    PackId = p.Id,
                })
                .ToListAsync();

                var packCount = new
                {
                    PackCount = packs.Count(),
                    Packs = packs,
                };



                // var listTag = await _context.Tags
                // .Where(t => t.Name.Contains(keywordDTO.Keyword))
                // .Include(t => t.SampleTags)?.ThenInclude(st => st.Samples).ToListAsync();

                // var altGenre = await _context.Packs.
                // Include(g => g.PackGenres).ThenInclude(pg => pg.Pack)
                // .Where(g => g.PackGenres.Any(pg => pg))


                return new
                {
                    result = new
                    {
                        Genres = listGenre,
                        Tags = listSamples,
                        Samples = sampleCount,
                        Packs = packCount,
                    },
                    err = "",
                };


                // await _context.Packs
                // .Include(pack => pack.PackGenres)
                // .ThenInclude(g => g.Genre.Where(g => ))


            }
            catch (Exception e)
            {
                var res = new
                {
                    result = new List<GetSampleDTO>(),
                    err = e.Message
                };
                return res;
            }


        }
        public async Task<object> HistoryOptions(PackSlugDTO dto)
        {


            try
            {

                User user = await _context.Users.Where(u => u.Username == dto.Username).FirstOrDefaultAsync();
                var options = await _context.Packs.TemporalAll()
                .Where(p => p.Slug == dto.Slug && p.UserId == user.Id)
                .OrderByDescending(p => EF.Property<DateTime>(p, "PeriodStart"))
                .Select(p =>
                new
                {
                    Date = (EF.Property<DateTime>(p, "PeriodStart")),
                    UpdatedBy = p.UpdatedBy,
                }
                ).ToListAsync();

                return new
                {
                    Result = options,
                    Err = "",
                };

            }
            catch (Exception e)
            {
                return new
                {
                    Result = "",
                    Err = e.Message,
                };
            }

        }

        public async Task<object> Compare(PackSlugDTO dto)
        {

            try
            {
                var pack = await _context.Packs.Where(p => p.Slug == dto.Slug && p.User.Username == dto.Username).SingleAsync();



                var asOf = await _context.Samples.TemporalAsOf(dto.On)
                .Where(s => s.PackId == pack.Id)
                .Include(s => s.SampleTags).ThenInclude(s => s.Tag)
                .OrderBy(s => s.CreatedDate)
                .IgnoreQueryFilters()
                .ToListAsync();

                var prev = await _context.Samples.TemporalAsOf(dto.On.AddSeconds(-1))
                .Where(s => s.PackId == pack.Id)
                .Include(s => s.SampleTags).ThenInclude(s => s.Tag)
                .OrderBy(s => s.CreatedDate)
                .IgnoreQueryFilters()
                .ToListAsync();

                var updatedAsOf = asOf.FindAll(d => d.DeletedBy == null);
                var updatedPrev = prev.FindAll(d => d.DeletedBy == null);

                var deletedAsOf = asOf.FindAll(d => d.DeletedBy != null);
                var deletedPrev = prev.FindAll(d => d.DeletedBy != null);


                return new
                {
                    Result = new
                    {
                        Deleted = new
                        {
                            asOf = _mapper.Map<List<GetSampleDTO>>(deletedAsOf),
                            prev = _mapper.Map<List<GetSampleDTO>>(deletedPrev)
                        },
                        Updated = new
                        {
                            asOf = _mapper.Map<List<GetSampleDTO>>(updatedAsOf),
                            prev = _mapper.Map<List<GetSampleDTO>>(updatedPrev),
                        }
                    },
                    Err = "",
                };


            }
            catch (Exception e)
            {

                return new
                {
                    Result = "",
                    Err = e.Message,
                };

            }


        }
        public async Task<ServiceResponse<List<PeriodDTO>>> History(PackSlugDTO dto)
        {
            var res = new ServiceResponse<List<PeriodDTO>>();
            try
            {
                var packSnapshots = await _context.Packs

                .TemporalAll()
                // .Include(s => s.PackGenres).ThenInclude(s => s.Genre)
                .Where(p => p.Slug == dto.Slug)
                // .TemporalAll()
                .OrderBy(p => EF.Property<DateTime>(p, "PeriodStart"))

                // .Where(p => p.Pack.Slug == dto.Slug && p.Pack.User.Username == dto.Username)
                .Select(p =>
                   new
                   {
                       Pack = p,
                       PeriodStart = EF.Property<DateTime>(p, "PeriodStart"),
                       PeriodEnd = EF.Property<DateTime>(p, "PeriodEnd")
                   }
                )
                .ToListAsync();

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

        public async Task<ServiceResponse<List<GetPackDTO>>> YourSamplePacks()
        {

            var res = new ServiceResponse<List<GetPackDTO>>();
            string? SubId = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            User? User = await _context.Users.FirstOrDefaultAsync(u => u.SubId == SubId);
            try
            {
                var pack = await _context.Packs
                .Where(p => p.UserId == User.Id)
                .OrderByDescending(p => p.UpdatedDate)
                // .Include(s => s.Group).ThenInclude(s => s.UserGroups).ThenInclude(s => s.User)
                // .Include(s => s.PackGenres).ThenInclude(s => s.Genre)
                // .Include(s => s.Samples).ThenInclude(s => s.SampleTags).ThenInclude(s => s.Tag)
                .ToListAsync();

                res.Result = _mapper.Map<List<GetPackDTO>>(pack);
            }
            catch (Exception e)
            {
                res.Err = e.Message;
            }

            return res;
        }

        public async Task<ServiceResponse<List<GetPackDTO>>> CollabPacks()
        {

            var res = new ServiceResponse<List<GetPackDTO>>();
            string? SubId = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            User? User = await _context.Users.FirstOrDefaultAsync(u => u.SubId == SubId);
            try
            {

                var groups = await _context.UserGroups.Where(u => u.UserId == User.Id).Include(s => s.Group).Select(g => g.GroupId).ToListAsync();

                var packs = await _context.Packs.Where(s => groups.Contains(s.GroupId ?? default)).Include(s => s.User).OrderByDescending(p => p.UpdatedDate).ToListAsync();

                res.Result = _mapper.Map<List<GetPackDTO>>(packs);
            }
            catch (Exception e)
            {
                res.Err = e.Message;
            }

            return res;
        }

        public async Task<object> SearchResults(SearchResultsDTO dto)
        {

            try
            {

                switch (dto.entity)
                {
                    case "genre":
                        var genre = await _context.Packs.Include(s => s.PackGenres)
                        .ThenInclude(s => s.Genre)
                        .Where( s => s.PackGenres.Any(t => t.Genre.Name == dto.keyword))
                        .ToListAsync();
                        return new
                        {
                            Result = _mapper.Map<List<GetPackDTO>>(genre),
                            Err = "",
                        };
                       
                    case "tag":
                        var tag = await _context.Samples.Include(s => s.SampleTags)
                        .ThenInclude(s => s.Tag)
                        .Where( s => s.SampleTags.Any(t => t.Tag.Name == dto.keyword))
                        .ToListAsync();
                        
                        return new
                        {
                            Result = _mapper.Map<List<GetSampleDTO>>(tag),
                            Err = "",
                        };
                       
                    case "sample":
                        var sample = await _context.Samples
                        .Include(s => s.SampleTags)
                        .ThenInclude(s => s.Tag)
                        .Where(s => s.Name.Contains(dto.keyword))
                        .ToListAsync();
                        return new {
                            Result = _mapper.Map<List<GetSampleDTO>>(sample),
                            Err = "",
                        };
                        
                    case "pack":
                        var pack = await _context.Packs
                        .Where(p => p.Name.Contains(dto.keyword))
                        .ToListAsync();
                        return new {
                            Result = _mapper.Map<List<GetPackDTO>>(pack),
                            Err = "",
                        };
                       
                    default:
                        return new {
                            Result = "",
                            Err = "",
                        };
                        
                }

               

            }
            catch (Exception e)
            {
                return new
                {
                    Result = "",
                    Err = e.Message
                };
                
            }

        }




    }







}